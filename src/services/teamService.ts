import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError, sanitizeForFirestore } from '../firebase/firebaseConfig';
import { TeamParticipation } from '../App';

const TEAMS_COLLECTION = 'teams';

/**
 * Subscribe to real-time updates for all participating teams in Firestore
 */
export function subscribeTeams(
  onUpdate: (teams: TeamParticipation[]) => void,
  onError?: (err: any) => void
): () => void {
  const teamsRef = collection(db, TEAMS_COLLECTION);
  return onSnapshot(
    teamsRef,
    snapshot => {
      const teams: TeamParticipation[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as TeamParticipation;
        teams.push({
          ...data,
          id: docSnap.id,
          // All teams are honored participants; no first or second place
          award: 'Participation'
        });
      });
      // Sort teams: by teamCode or createdAt
      teams.sort((a, b) => (a.teamCode || a.projectName || '').localeCompare(b.teamCode || b.projectName || ''));
      onUpdate(teams);
    },
    error => {
      console.error('Real-time teams subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, TEAMS_COLLECTION);
    }
  );
}

/**
 * Save or update a single team in Firestore
 */
export async function saveTeamToFirestore(team: TeamParticipation): Promise<void> {
  const teamId = team.id;
  const path = `${TEAMS_COLLECTION}/${teamId}`;
  try {
    const cleaned = sanitizeForFirestore(team);
    await setDoc(doc(db, TEAMS_COLLECTION, teamId), cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a team from Firestore
 */
export async function deleteTeamFromFirestore(teamId: string): Promise<void> {
  const path = `${TEAMS_COLLECTION}/${teamId}`;
  try {
    await deleteDoc(doc(db, TEAMS_COLLECTION, teamId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Bulk import teams to Firestore (append or replace)
 */
export async function bulkImportTeamsToFirestore(
  newTeams: TeamParticipation[],
  mode: 'append' | 'replace'
): Promise<void> {
  try {
    if (mode === 'replace') {
      // First fetch existing docs to delete them
      const existingSnap = await getDocs(collection(db, TEAMS_COLLECTION));
      const deleteBatch = writeBatch(db);
      existingSnap.forEach(d => {
        deleteBatch.delete(d.ref);
      });
      await deleteBatch.commit();
    }

    // Write new teams in batches of up to 400
    const chunkSize = 400;
    for (let i = 0; i < newTeams.length; i += chunkSize) {
      const chunk = newTeams.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach(team => {
        const teamRef = doc(db, TEAMS_COLLECTION, team.id);
        const cleaned = sanitizeForFirestore(team);
        batch.set(teamRef, cleaned, { merge: true });
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, TEAMS_COLLECTION);
  }
}

/**
 * Seeds initial demo teams if Firestore collection is currently empty
 */
export async function seedInitialTeamsIfEmpty(defaultTeams: TeamParticipation[]): Promise<boolean> {
  try {
    const snapshot = await getDocs(collection(db, TEAMS_COLLECTION));
    if (snapshot.empty && defaultTeams.length > 0) {
      const batch = writeBatch(db);
      defaultTeams.forEach(team => {
        const teamRef = doc(db, TEAMS_COLLECTION, team.id);
        const cleaned = sanitizeForFirestore(team);
        batch.set(teamRef, cleaned);
      });
      await batch.commit();
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Initial seeding check notice (will use in-memory until connected):', error);
    return false;
  }
}
