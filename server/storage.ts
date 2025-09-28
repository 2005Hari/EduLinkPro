import { 
  users, 
  courses, 
  assignments, 
  announcements, 
  courseEnrollments,
  assignmentSubmissions,
  timetableEntries,
  emotionEntries,
  notifications,
  parentChildren,
  courseMaterials,
  attendanceRecords,
  type User, 
  type InsertUser,
  type Course,
  type Assignment,
  type Announcement,
  type AssignmentSubmission,
  type TimetableEntry,
  type EmotionEntry
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, count, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Course management
  getCoursesByTeacher(teacherId: string): Promise<Course[]>;
  getCoursesByStudent(studentId: string): Promise<Course[]>;
  createCourse(course: any, teacherId: string): Promise<Course>;
  enrollStudent(courseId: string, studentId: string): Promise<void>;
  
  // Assignment management
  getAssignmentsByCourse(courseId: string): Promise<Assignment[]>;
  getAssignmentsByStudent(studentId: string): Promise<any[]>;
  getAssignmentsByTeacher(teacherId: string): Promise<any[]>;
  createAssignment(assignment: any): Promise<Assignment>;
  submitAssignment(submission: any): Promise<AssignmentSubmission>;
  gradeAssignment(submissionId: string, grade: number, feedback: string): Promise<void>;
  
  // Announcements
  getAnnouncements(userId: string): Promise<Announcement[]>;
  createAnnouncement(announcement: any): Promise<Announcement>;
  
  // Timetable
  getTimetableByStudent(studentId: string): Promise<TimetableEntry[]>;
  createTimetableEntry(entry: any): Promise<TimetableEntry>;
  
  // Emotions
  getEmotionsByStudent(studentId: string): Promise<EmotionEntry[]>;
  createEmotionEntry(entry: any, studentId: string): Promise<EmotionEntry>;
  
  // Parent functionality
  getChildrenByParent(parentId: string): Promise<User[]>;
  linkParentChild(parentId: string, childId: string): Promise<void>;
  
  // Analytics
  getTeacherAnalytics(teacherId: string): Promise<{
    totalStudents: number;
    assignmentsGraded: number;
    averageGrade: number;
    recentActivity: any[];
  }>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.teacherId, teacherId))
      .orderBy(desc(courses.createdAt));
  }

  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    return await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        teacherId: courses.teacherId,
        thumbnail: courses.thumbnail,
        isActive: courses.isActive,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        progress: courseEnrollments.progress,
      })
      .from(courses)
      .innerJoin(courseEnrollments, eq(courses.id, courseEnrollments.courseId))
      .where(eq(courseEnrollments.studentId, studentId))
      .orderBy(desc(courses.createdAt));
  }

  async createCourse(course: any, teacherId: string): Promise<Course> {
    const [newCourse] = await db
      .insert(courses)
      .values({ ...course, teacherId })
      .returning();
    return newCourse;
  }

  async enrollStudent(courseId: string, studentId: string): Promise<void> {
    // Check if student is already enrolled
    const existingEnrollment = await db
      .select()
      .from(courseEnrollments)
      .where(and(
        eq(courseEnrollments.courseId, courseId),
        eq(courseEnrollments.studentId, studentId)
      ))
      .limit(1);

    // If already enrolled, do nothing (idempotent operation)
    if (existingEnrollment.length > 0) {
      return;
    }

    // Otherwise, enroll the student
    await db
      .insert(courseEnrollments)
      .values({ courseId, studentId });
  }

  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.courseId, courseId))
      .orderBy(asc(assignments.dueDate));
  }

  async getAssignmentById(assignmentId: string): Promise<any> {
    const [assignment] = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        courseId: assignments.courseId,
        teacherId: courses.teacherId,
        courseTitle: courses.title,
      })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .where(eq(assignments.id, assignmentId));
    return assignment;
  }

  async getSubmissionById(submissionId: string): Promise<any> {
    const [submission] = await db
      .select({
        id: assignmentSubmissions.id,
        assignmentId: assignmentSubmissions.assignmentId,
        studentId: assignmentSubmissions.studentId,
        grade: assignmentSubmissions.grade,
        status: assignmentSubmissions.status,
      })
      .from(assignmentSubmissions)
      .where(eq(assignmentSubmissions.id, submissionId));
    return submission;
  }

  async getAssignmentsByStudent(studentId: string): Promise<any[]> {
    return await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        dueDate: assignments.dueDate,
        maxPoints: assignments.maxPoints,
        courseTitle: courses.title,
        status: assignmentSubmissions.status,
        grade: assignmentSubmissions.grade,
        submittedAt: assignmentSubmissions.submittedAt,
      })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .innerJoin(courseEnrollments, eq(courses.id, courseEnrollments.courseId))
      .leftJoin(assignmentSubmissions, 
        and(
          eq(assignments.id, assignmentSubmissions.assignmentId),
          eq(assignmentSubmissions.studentId, studentId)
        )
      )
      .where(eq(courseEnrollments.studentId, studentId))
      .orderBy(asc(assignments.dueDate));
  }

  async getAssignmentsByTeacher(teacherId: string): Promise<any[]> {
    return await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        dueDate: assignments.dueDate,
        maxPoints: assignments.maxPoints,
        courseTitle: courses.title,
        courseId: courses.id,
        submissionCount: count(assignmentSubmissions.id),
        createdAt: assignments.createdAt,
      })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .leftJoin(assignmentSubmissions, eq(assignments.id, assignmentSubmissions.assignmentId))
      .where(eq(courses.teacherId, teacherId))
      .groupBy(assignments.id, courses.id, courses.title)
      .orderBy(desc(assignments.createdAt));
  }

  async createAssignment(assignment: any): Promise<Assignment> {
    const [newAssignment] = await db
      .insert(assignments)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async submitAssignment(submission: any): Promise<AssignmentSubmission> {
    const [newSubmission] = await db
      .insert(assignmentSubmissions)
      .values({ ...submission, status: "submitted" })
      .returning();
    return newSubmission;
  }

  async gradeAssignment(submissionId: string, grade: number, feedback: string): Promise<void> {
    await db
      .update(assignmentSubmissions)
      .set({ 
        grade, 
        feedback, 
        status: "graded",
        gradedAt: new Date()
      })
      .where(eq(assignmentSubmissions.id, submissionId));
  }

  async getAnnouncements(userId: string): Promise<Announcement[]> {
    // Get user's enrolled courses
    const userCourses = await db
      .select({ courseId: courseEnrollments.courseId })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.studentId, userId));

    const courseIds = userCourses.map(c => c.courseId);

    return await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        authorId: announcements.authorId,
        courseId: announcements.courseId,
        isGlobal: announcements.isGlobal,
        createdAt: announcements.createdAt,
        authorName: users.firstName,
        courseName: courses.title,
      })
      .from(announcements)
      .innerJoin(users, eq(announcements.authorId, users.id))
      .leftJoin(courses, eq(announcements.courseId, courses.id))
      .where(
        or(
          eq(announcements.isGlobal, true),
          courseIds.length > 0 ? eq(announcements.courseId, courseIds[0]) : eq(announcements.isGlobal, true)
        )
      )
      .orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: any): Promise<Announcement> {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values(announcement)
      .returning();
    return newAnnouncement;
  }

  async getTimetableByStudent(studentId: string): Promise<TimetableEntry[]> {
    return await db
      .select({
        id: timetableEntries.id,
        title: timetableEntries.title,
        dayOfWeek: timetableEntries.dayOfWeek,
        startTime: timetableEntries.startTime,
        endTime: timetableEntries.endTime,
        location: timetableEntries.location,
        courseTitle: courses.title,
        courseId: timetableEntries.courseId,
        createdAt: timetableEntries.createdAt,
      })
      .from(timetableEntries)
      .innerJoin(courses, eq(timetableEntries.courseId, courses.id))
      .innerJoin(courseEnrollments, eq(courses.id, courseEnrollments.courseId))
      .where(eq(courseEnrollments.studentId, studentId))
      .orderBy(asc(timetableEntries.dayOfWeek), asc(timetableEntries.startTime));
  }

  async createTimetableEntry(entry: any): Promise<TimetableEntry> {
    const [newEntry] = await db
      .insert(timetableEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async getEmotionsByStudent(studentId: string): Promise<EmotionEntry[]> {
    return await db
      .select()
      .from(emotionEntries)
      .where(eq(emotionEntries.studentId, studentId))
      .orderBy(desc(emotionEntries.detectedAt))
      .limit(50);
  }

  async createEmotionEntry(entry: any, studentId: string): Promise<EmotionEntry> {
    const [newEntry] = await db
      .insert(emotionEntries)
      .values({ ...entry, studentId })
      .returning();
    return newEntry;
  }

  async getChildrenByParent(parentId: string): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        profilePicture: users.profilePicture,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        password: users.password,
      })
      .from(users)
      .innerJoin(parentChildren, eq(users.id, parentChildren.childId))
      .where(eq(parentChildren.parentId, parentId));
  }

  async linkParentChild(parentId: string, childId: string): Promise<void> {
    await db
      .insert(parentChildren)
      .values({ parentId, childId });
  }

  async getTeacherAnalytics(teacherId: string): Promise<{
    totalStudents: number;
    assignmentsGraded: number;
    averageGrade: number;
    recentActivity: any[];
  }> {
    // Get courses taught by this teacher
    const teacherCourses = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.teacherId, teacherId));
    
    const courseIds = teacherCourses.map(course => course.id);
    
    if (courseIds.length === 0) {
      return {
        totalStudents: 0,
        assignmentsGraded: 0,
        averageGrade: 0,
        recentActivity: []
      };
    }

    // Count total students enrolled in teacher's courses
    const [studentsResult] = await db
      .select({ count: count() })
      .from(courseEnrollments)
      .where(courseIds.length === 1 
        ? eq(courseEnrollments.courseId, courseIds[0])
        : or(...courseIds.map(id => eq(courseEnrollments.courseId, id)))
      );

    // Get assignments created by this teacher and count graded ones
    const teacherAssignments = await db
      .select({ id: assignments.id })
      .from(assignments)
      .where(courseIds.length === 1 
        ? eq(assignments.courseId, courseIds[0])
        : or(...courseIds.map(id => eq(assignments.courseId, id)))
      );
    
    const assignmentIds = teacherAssignments.map(a => a.id);
    
    let assignmentsGraded = 0;
    let averageGrade = 0;
    
    if (assignmentIds.length > 0) {
      // Count graded assignments
      const [gradedResult] = await db
        .select({ count: count() })
        .from(assignmentSubmissions)
        .where(and(
          assignmentIds.length === 1 
            ? eq(assignmentSubmissions.assignmentId, assignmentIds[0])
            : or(...assignmentIds.map(id => eq(assignmentSubmissions.assignmentId, id))),
          sql`grade IS NOT NULL`
        ));
      
      assignmentsGraded = gradedResult.count;

      // Calculate average grade
      const gradeResults = await db
        .select({ grade: assignmentSubmissions.grade })
        .from(assignmentSubmissions)
        .where(and(
          assignmentIds.length === 1 
            ? eq(assignmentSubmissions.assignmentId, assignmentIds[0])
            : or(...assignmentIds.map(id => eq(assignmentSubmissions.assignmentId, id))),
          sql`grade IS NOT NULL`
        ));
      
      if (gradeResults.length > 0) {
        const totalGrade = gradeResults.reduce((sum, result) => sum + (result.grade || 0), 0);
        averageGrade = Math.round((totalGrade / gradeResults.length) * 10) / 10;
      }
    }

    // Get recent activity (recent submissions and grading)
    let recentActivity = [];
    if (assignmentIds.length > 0) {
      recentActivity = await db
        .select({
          id: assignmentSubmissions.id,
          type: sql`'submission'`.as('type'),
          assignmentTitle: assignments.title,
          studentName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as('studentName'),
          timestamp: assignmentSubmissions.submittedAt,
          status: assignmentSubmissions.status
        })
        .from(assignmentSubmissions)
        .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
        .innerJoin(users, eq(assignmentSubmissions.studentId, users.id))
        .where(assignmentIds.length === 1 
          ? eq(assignments.id, assignmentIds[0])
          : or(...assignmentIds.map(id => eq(assignments.id, id)))
        )
        .orderBy(desc(assignmentSubmissions.submittedAt))
        .limit(10);
    }

    return {
      totalStudents: studentsResult.count,
      assignmentsGraded,
      averageGrade,
      recentActivity
    };
  }
}

export const storage = new DatabaseStorage();
