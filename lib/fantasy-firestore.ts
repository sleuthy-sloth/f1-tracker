/**
 * Fantasy F1 Firestore Persistence Service
 * Handles all Firestore CRUD operations for fantasy teams and leagues
 */

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

// ============================================================================
// Types
// ============================================================================

/**
 * Fantasy driver stored in Firestore
 */
export interface FantasyDriverData {
  driverNumber: number;
  nameAcronym: string;
  fullName: string;
  teamColour: string;
  cost: number;
  points: number;
}

/**
 * Fantasy constructor stored in Firestore
 */
export interface FantasyConstructorData {
  name: string;
  cost: number;
  points: number;
  colour: string;
}

/**
 * Fantasy team data structure for persistence
 * Matches FantasyDashboard's FantasyTeam shape plus Firebase metadata
 */
export interface FantasyTeamData {
  teamName: string;
  totalPoints: number;
  budgetRemaining: number;
  drivers: FantasyDriverData[];
  constructor: FantasyConstructorData | null;
  pointsHistory: number[];
  uid: string;
  createdAt: ReturnType<typeof serverTimestamp> | Date | null;
  updatedAt: ReturnType<typeof serverTimestamp> | Date | null;
}

/**
 * Fantasy team document with Firestore document ID
 */
export interface FantasyTeamDocument extends FantasyTeamData {
  id: string;
}

/**
 * League entry member data (matches LeagueLeaderboard's LeagueEntry)
 */
export interface LeagueEntry {
  playerName: string;
  teamName: string;
  totalPoints: number;
  rankTrend: "up" | "down" | "neutral";
}

/**
 * League data structure (matches LeagueLeaderboard's LeagueData)
 */
export interface LeagueData {
  id: string;
  name: string;
  inviteCode: string;
  members: LeagueEntry[];
}

/**
 * League member data stored within league document
 */
export interface LeagueMemberData {
  uid: string;
  teamName: string;
  totalPoints: number;
}

/**
 * Full league document with Firestore metadata
 */
export interface LeagueDocument extends LeagueData {
  createdAt: ReturnType<typeof serverTimestamp> | Date | null;
  createdBy: string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Gets the Firestore instance or throws if unavailable
 */
function getDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firebase database not available. Ensure Firebase is initialized.");
  }
  return db;
}

/**
 * Generates a random invite code in format "FF-XXXX"
 * where XXXX is random uppercase alphanumeric
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FF-${code}`;
}

// ============================================================================
// Fantasy Team Functions
// ============================================================================

/**
 * Saves or updates a fantasy team for a user
 * @param uid - User's Firebase auth UID
 * @param team - Fantasy team data to save
 */
export async function saveFantasyTeam(uid: string, team: FantasyTeamData): Promise<void> {
  const db = getDb();
  
  try {
    const teamRef = doc(db, "fantasy-teams", uid);
    await setDoc(teamRef, {
      ...team,
      uid,
      updatedAt: serverTimestamp(),
      // Preserve createdAt if not present in team
      createdAt: team.createdAt || serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error saving fantasy team:", error);
    throw error;
  }
}

/**
 * Loads a fantasy team for a user
 * @param uid - User's Firebase auth UID
 * @returns The fantasy team document or null if not found
 */
export async function loadFantasyTeam(uid: string): Promise<FantasyTeamDocument | null> {
  const db = getDb();
  
  try {
    const teamRef = doc(db, "fantasy-teams", uid);
    const snapshot = await getDoc(teamRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    const constructorData = data.constructor;
    const isValidConstructor = constructorData !== null && 
      constructorData !== undefined &&
      typeof constructorData === 'object' && 
      'cost' in constructorData && 
      'points' in constructorData;
    
    return {
      id: snapshot.id,
      teamName: data.teamName,
      totalPoints: data.totalPoints,
      budgetRemaining: data.budgetRemaining,
      drivers: data.drivers || [],
      constructor: isValidConstructor ? constructorData : null,
      pointsHistory: data.pointsHistory || [],
      uid: data.uid,
      createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
    };
  } catch (error) {
    console.error("Error loading fantasy team:", error);
    throw error;
  }
}

/**
 * Deletes a fantasy team for a user
 * @param uid - User's Firebase auth UID
 */
export async function deleteFantasyTeam(uid: string): Promise<void> {
  const db = getDb();
  
  try {
    const teamRef = doc(db, "fantasy-teams", uid);
    await deleteDoc(teamRef);
  } catch (error) {
    console.error("Error deleting fantasy team:", error);
    throw error;
  }
}

// ============================================================================
// League Functions
// ============================================================================

/**
 * Creates a new league
 * @param name - League name
 * @param creatorUid - UID of the user creating the league
 * @param creatorTeamName - Team name of the creator
 * @returns The created league's document ID
 */
export async function createLeague(
  name: string,
  creatorUid: string,
  creatorTeamName: string
): Promise<string> {
  const db = getDb();
  
  try {
    const leagueRef = doc(collection(db, "leagues"));
    const inviteCode = generateInviteCode();
    
    await setDoc(leagueRef, {
      id: leagueRef.id,
      name,
      inviteCode,
      members: [
        {
          playerName: creatorUid, // Could be enhanced to store display name
          teamName: creatorTeamName,
          totalPoints: 0,
          rankTrend: "neutral" as const,
        },
      ],
      createdAt: serverTimestamp(),
      createdBy: creatorUid,
    });
    
    return leagueRef.id;
  } catch (error) {
    console.error("Error creating league:", error);
    throw error;
  }
}

/**
 * Joins a league using an invite code
 * Note: Uses collection group query - requires proper Firestore indexing
 * @param inviteCode - The league invite code
 * @param uid - UID of the user joining
 * @param teamName - User's team name
 * @returns The league ID if found, null otherwise
 */
export async function joinLeague(
  inviteCode: string,
  uid: string,
  teamName: string
): Promise<string | null> {
  const db = getDb();
  
  try {
    // Query leagues collection for matching invite code
    // Since inviteCode is unique, we query the collection
    const leaguesRef = collection(db, "leagues");
    const q = query(leaguesRef, where("inviteCode", "==", inviteCode.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const leagueDoc = snapshot.docs[0];
    const leagueData = leagueDoc.data();
    
    // Check if user is already a member
    const existingMember = leagueData.members?.find(
      (m: LeagueEntry) => m.playerName === uid
    );
    
    if (existingMember) {
      // Already a member, return league ID
      return leagueDoc.id;
    }
    
    // Add new member
    const updatedMembers = [
      ...(leagueData.members || []),
      {
        playerName: uid,
        teamName,
        totalPoints: 0,
        rankTrend: "neutral" as const,
      },
    ];
    
    await setDoc(
      doc(db, "leagues", leagueDoc.id),
      { members: updatedMembers },
      { merge: true }
    );
    
    return leagueDoc.id;
  } catch (error) {
    console.error("Error joining league:", error);
    throw error;
  }
}

/**
 * Removes a member from a league
 * @param leagueId - The league ID
 * @param uid - UID of the user leaving
 */
export async function leaveLeague(leagueId: string, uid: string): Promise<void> {
  const db = getDb();
  
  try {
    const leagueRef = doc(db, "leagues", leagueId);
    const snapshot = await getDoc(leagueRef);
    
    if (!snapshot.exists()) {
      throw new Error("League not found");
    }
    
    const leagueData = snapshot.data();
    const updatedMembers = (leagueData.members || []).filter(
      (m: LeagueEntry) => m.playerName !== uid
    );
    
    await setDoc(
      leagueRef,
      { members: updatedMembers },
      { merge: true }
    );
  } catch (error) {
    console.error("Error leaving league:", error);
    throw error;
  }
}

/**
 * Loads a league by ID
 * @param leagueId - The league ID
 * @returns The league document or null if not found
 */
export async function loadLeague(leagueId: string): Promise<LeagueDocument | null> {
  const db = getDb();
  
  try {
    const leagueRef = doc(db, "leagues", leagueId);
    const snapshot = await getDoc(leagueRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    return {
      id: snapshot.id,
      name: data.name,
      inviteCode: data.inviteCode,
      members: data.members || [],
      createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      createdBy: data.createdBy,
    };
  } catch (error) {
    console.error("Error loading league:", error);
    throw error;
  }
}

/**
 * Loads all leagues a user is a member of
 * @param uid - User's Firebase auth UID
 * @returns Array of league documents
 */
export async function loadUserLeagues(uid: string): Promise<LeagueDocument[]> {
  const db = getDb();
  
  try {
    // Query all leagues and filter client-side for member
    // Note: For large datasets, consider adding a subcollection for members
    const leaguesRef = collection(db, "leagues");
    const snapshot = await getDocs(leaguesRef);
    
    const userLeagues: LeagueDocument[] = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const isMember = data.members?.some(
        (m: LeagueEntry) => m.playerName === uid
      );
      
      if (isMember) {
        userLeagues.push({
          id: docSnap.id,
          name: data.name,
          inviteCode: data.inviteCode,
          members: data.members || [],
          createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
          createdBy: data.createdBy,
        });
      }
    });
    
    return userLeagues;
  } catch (error) {
    console.error("Error loading user leagues:", error);
    throw error;
  }
}