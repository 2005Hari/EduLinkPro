import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCourseSchema, insertAssignmentSchema, insertAnnouncementSchema, insertEmotionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Course routes
  app.get("/api/courses", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      let courses;
      
      if (user.role === "teacher") {
        courses = await storage.getCoursesByTeacher(user.id);
      } else if (user.role === "student") {
        courses = await storage.getCoursesByStudent(user.id);
      } else {
        courses = [];
      }
      
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.post("/api/courses", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers can create courses" });
      }
      
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData, req.user.id);
      
      // Broadcast new course to connected clients
      broadcastToClients({
        type: "new_course",
        data: course
      });
      
      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.post("/api/courses/:id/enroll", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Only students can enroll in courses" });
      }
      
      const courseId = req.params.id;
      const studentId = req.user.id;
      
      await storage.enrollStudent(courseId, studentId);
      
      res.status(201).json({ message: "Successfully enrolled in course", courseId, studentId });
    } catch (error) {
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  // Get enrolled students for a teacher
  app.get("/api/students/enrolled", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers can access enrolled students" });
      }
      
      const enrolledStudents = await storage.getEnrolledStudentsByTeacher(req.user.id);
      res.json(enrolledStudents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrolled students" });
    }
  });

  // Teacher analytics route
  app.get("/api/teacher/analytics", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers can access analytics" });
      }
      
      const analytics = await storage.getTeacherAnalytics(req.user.id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teacher analytics" });
    }
  });

  // Assignment routes
  app.get("/api/assignments", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      
      if (user.role === "student") {
        const assignments = await storage.getAssignmentsByStudent(user.id);
        res.json(assignments);
      } else if (user.role === "teacher") {
        const assignments = await storage.getAssignmentsByTeacher(user.id);
        res.json(assignments);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post("/api/assignments", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers can create assignments" });
      }
      
      console.log("[DEBUG] Assignment creation - Request body:", req.body);
      const assignmentData = insertAssignmentSchema.parse(req.body);
      console.log("[DEBUG] Assignment creation - Parsed data:", assignmentData);
      
      const assignment = await storage.createAssignment(assignmentData);
      console.log("[DEBUG] Assignment creation - Created assignment:", assignment);
      
      // Broadcast new assignment to connected clients
      broadcastToClients({
        type: "new_assignment",
        data: assignment
      });
      
      res.status(201).json(assignment);
    } catch (error) {
      console.error("[ERROR] Assignment creation failed:", error);
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  app.post("/api/assignments/:id/submit", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Only students can submit assignments" });
      }
      
      const submission = await storage.submitAssignment({
        assignmentId: req.params.id,
        studentId: req.user.id,
        content: req.body.content,
        attachments: req.body.attachments
      });

      // Broadcast new submission to relevant users only (specific teacher)
      try {
        // Get assignment details to find the specific teacher
        const assignment = await storage.getAssignmentById(req.params.id);
        if (!assignment) {
          console.error('Failed to find assignment for submission notification');
        } else {
          const teacherId = assignment.teacherId;
          const targetUsers = [teacherId]; // Only the specific teacher
          
          // Send only to the assignment's teacher to avoid privacy leaks
          broadcastToSpecificUsers({
            type: "new_submission",
            data: {
              submissionId: submission.id,
              assignmentId: req.params.id,
              studentId: req.user.id
            }
          }, targetUsers);
          
          console.log(`Submission notification sent for assignment ${req.params.id} to teacher ${teacherId}`);
        }
      } catch (error) {
        console.error('Failed to broadcast submission notification:', error);
      }
      
      res.status(201).json(submission);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });

  app.post("/api/assignments/:id/grade", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers can grade assignments" });
      }
      
      const { submissionId, grade, feedback } = req.body;
      
      if (!submissionId || grade === undefined) {
        return res.status(400).json({ message: "Submission ID and grade are required" });
      }
      
      await storage.gradeAssignment(submissionId, grade, feedback || "");

      // Broadcast grade update to relevant users only (student and parents)
      try {
        // Get submission details to securely derive student ID
        const submission = await storage.getSubmissionById(submissionId);
        if (!submission) {
          console.error('Failed to find submission for grading notification');
          return;
        }
        
        const studentId = submission.studentId;
        const targetUsers = [studentId]; // Include the student
        
        // Send only to the graded student to avoid privacy leaks
        broadcastToSpecificUsers({
          type: "grade_updated",
          data: {
            submissionId,
            assignmentId: req.params.id,
            grade,
            feedback
          }
        }, targetUsers);
        
        console.log(`Grade notification sent for assignment ${req.params.id} to student ${studentId}`);
      } catch (error) {
        console.error('Failed to broadcast grade notification:', error);
      }
      
      res.json({ message: "Assignment graded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to grade assignment" });
    }
  });

  // Announcement routes
  app.get("/api/announcements", requireAuth, async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements(req.user.id);
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/announcements", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers can create announcements" });
      }
      
      const announcementData = insertAnnouncementSchema.parse({
        ...req.body,
        authorId: req.user.id
      });
      
      const announcement = await storage.createAnnouncement(announcementData);
      
      // Broadcast announcement to connected clients
      broadcastToClients({
        type: "new_announcement",
        data: announcement
      });
      
      res.status(201).json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  // Timetable routes
  app.get("/api/timetable", requireAuth, async (req, res) => {
    try {
      const timetable = await storage.getTimetableByStudent(req.user.id);
      res.json(timetable);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  });

  app.post("/api/timetable", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers can create timetable entries" });
      }
      
      const entry = await storage.createTimetableEntry(req.body);
      
      // Broadcast timetable update to connected clients
      broadcastToClients({
        type: "timetable_updated",
        data: entry
      });
      
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create timetable entry" });
    }
  });

  // Emotion routes
  app.get("/api/emotions", requireAuth, async (req, res) => {
    try {
      const emotions = await storage.getEmotionsByStudent(req.user.id);
      res.json(emotions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emotions" });
    }
  });

  app.post("/api/emotions", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Only students can record emotions" });
      }
      
      const emotionData = insertEmotionSchema.parse(req.body);
      const emotion = await storage.createEmotionEntry(emotionData, req.user.id);
      res.status(201).json(emotion);
    } catch (error) {
      res.status(500).json({ message: "Failed to record emotion" });
    }
  });

  // Parent routes
  app.get("/api/children", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "parent") {
        return res.status(403).json({ message: "Only parents can access this endpoint" });
      }
      
      const children = await storage.getChildrenByParent(req.user.id);
      res.json(children);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  // Helper function to verify parent-child relationship
  async function verifyParentChildRelationship(parentId: string, childId: string): Promise<boolean> {
    const children = await storage.getChildrenByParent(parentId);
    return children.some(child => child.id === childId);
  }

  app.get("/api/children/:childId/assignments", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "parent") {
        return res.status(403).json({ message: "Only parents can access this endpoint" });
      }
      
      const { childId } = req.params;
      
      // Verify this child belongs to the parent
      const isValidChild = await verifyParentChildRelationship(req.user.id, childId);
      if (!isValidChild) {
        return res.status(403).json({ message: "You can only access your own children's data" });
      }
      
      const assignments = await storage.getAssignmentsByStudent(childId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch child's assignments" });
    }
  });

  app.get("/api/children/:childId/courses", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "parent") {
        return res.status(403).json({ message: "Only parents can access this endpoint" });
      }
      
      const { childId } = req.params;
      
      // Verify this child belongs to the parent
      const isValidChild = await verifyParentChildRelationship(req.user.id, childId);
      if (!isValidChild) {
        return res.status(403).json({ message: "You can only access your own children's data" });
      }
      
      const courses = await storage.getCoursesByStudent(childId);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch child's courses" });
    }
  });

  app.get("/api/children/:childId/emotions", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "parent") {
        return res.status(403).json({ message: "Only parents can access this endpoint" });
      }
      
      const { childId } = req.params;
      
      // Verify this child belongs to the parent
      const isValidChild = await verifyParentChildRelationship(req.user.id, childId);
      if (!isValidChild) {
        return res.status(403).json({ message: "You can only access your own children's data" });
      }
      
      const emotions = await storage.getEmotionsByStudent(childId);
      res.json(emotions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch child's emotions" });
    }
  });

  // Message routes
  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessagesByUser(req.user.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/conversation/:userId", requireAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getConversation(req.user.id, userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const message = await storage.createMessage({
        ...req.body,
        senderId: req.user.id
      });
      
      // Broadcast new message to receiver
      broadcastToSpecificUsers({
        type: "new_message",
        data: message
      }, [req.body.receiverId]);
      
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch("/api/messages/:messageId/read", requireAuth, async (req, res) => {
    try {
      const { messageId } = req.params;
      await storage.markMessageAsRead(messageId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Meeting routes
  app.get("/api/meetings", requireAuth, async (req, res) => {
    try {
      let meetings;
      if (req.user.role === "parent") {
        meetings = await storage.getMeetingsByParent(req.user.id);
      } else if (req.user.role === "teacher") {
        meetings = await storage.getMeetingsByTeacher(req.user.id);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.post("/api/meetings", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "parent") {
        return res.status(403).json({ message: "Only parents can schedule meetings" });
      }
      
      const meeting = await storage.createMeeting({
        ...req.body,
        parentId: req.user.id
      });
      
      // Notify teacher about new meeting request
      broadcastToSpecificUsers({
        type: "new_meeting",
        data: meeting
      }, [req.body.teacherId]);
      
      res.status(201).json(meeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.patch("/api/meetings/:meetingId/status", requireAuth, async (req, res) => {
    try {
      const { meetingId } = req.params;
      const { status } = req.body;
      await storage.updateMeetingStatus(meetingId, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update meeting status" });
    }
  });

  // Event routes
  app.get("/api/events", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let events;
      
      if (startDate && endDate) {
        events = await storage.getEventsByDate(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        // Get events for current month by default
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        events = await storage.getEventsByDate(firstDay, lastDay);
      }
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", requireAuth, async (req, res) => {
    try {
      const event = await storage.createEvent({
        ...req.body,
        createdBy: req.user.id
      });
      
      // Broadcast new event
      broadcastToClients({
        type: "new_event",
        data: event
      });
      
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup with user tracking
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<WebSocket, { userId: string; role: string }>();

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'auth') {
          // Store user info with WebSocket connection
          clients.set(ws, { userId: message.userId, role: message.role });
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Broadcast functions
  function broadcastToClients(message: any) {
    const messageString = JSON.stringify(message);
    clients.forEach((userInfo, client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  function broadcastToSpecificUsers(message: any, targetUserIds: string[]) {
    const messageString = JSON.stringify(message);
    clients.forEach((userInfo, client) => {
      if (client.readyState === WebSocket.OPEN && targetUserIds.includes(userInfo.userId)) {
        client.send(messageString);
      }
    });
  }

  function broadcastToRoles(message: any, targetRoles: string[]) {
    const messageString = JSON.stringify(message);
    clients.forEach((userInfo, client) => {
      if (client.readyState === WebSocket.OPEN && targetRoles.includes(userInfo.role)) {
        client.send(messageString);
      }
    });
  }

  return httpServer;
}
