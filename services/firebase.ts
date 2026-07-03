import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD_gh5tPjnX6xE-b1c_YzKjnACgt0zxjDg",
  authDomain: "veritas-inmueble-2.firebaseapp.com",
  projectId: "veritas-inmueble-2",
  storageBucket: "veritas-inmueble-2.firebasestorage.app",
  messagingSenderId: "633704939001",
  appId: "1:633704939001:web:41f7be304d1d124dc29128",
  measurementId: "G-1LPLG6CG3T"
};

// Initialize Firebase
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export services for use in other parts of the app
export { auth, db, storage, firebase };

export async function syncAgencyScores(agencyId: string) {
    if (!agencyId) return;
    try {
        const docRef = db.collection('inmobiliarias').doc(agencyId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return;
        
        // We must import these dynamically or at top level to avoid circular deps.
        // Let's just import them at the top of the file or require them.
        const { calculateAgencyScore, calculateSocialVerdict } = await import('../constants');
        const agency = docSnap.data() as any;

        const reviewsSnap = await db.collection('resenas').where('inmobiliariaId', '==', agencyId).get();
        const reviews = reviewsSnap.docs.map(d => d.data() as any);

        const calculatedScore = calculateAgencyScore(agency);
        const calculatedIndice = calculateSocialVerdict(agency, reviews);

        let ratingAvg = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc: number, r: any) => acc + (r.calificacion || 0), 0);
            ratingAvg = sum / reviews.length;
        }

        await docRef.update({
            score: calculatedScore,
            indiceConfianza: calculatedIndice,
            ratingAvg,
            ratingCount: reviews.length
        });
    } catch (e) {
        console.error("Failed to sync agency scores:", e);
    }
}