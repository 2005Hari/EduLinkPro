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

  // Assignment routes
  app.get("/api/assignments", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      
      if (user.role === "student") {
        const assignments = await storage.getAssignmentsByStudent(user.id);
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
      
      const assignmentData = insertAssignmentSchema.parse(req.body);
      const assignment = await storage.createAssignment(assignmentData);
      
      // Broadcast new assignment to connected clients
      broadcastToClients({
        type: "new_assignment",
        data: assignment
      });
      
      res.status(201).json(assignment);
    } catch (error) {
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
      
      res.status(201).json(submission);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit assignment" });
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
        type: "timetable_update",
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

  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Broadcast function
  function broadcastToClients(message: any) {
    const messageString = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  return httpServer;
}
