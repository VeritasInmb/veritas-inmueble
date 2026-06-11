import { firebase } from './services/firebase';
import { blogPosts } from './blogData';
import { mockForumTopics, mockForumReplies } from './mockForumData';

const db = firebase.firestore();

async function seed() {
  try {
    console.log("Seeding Blogs...");
    let batch = db.batch();
    for (const post of blogPosts) {
      const ref = db.collection('blogs').doc(String(post.id));
      batch.set(ref, { ...post, id: String(post.id) });
    }
    await batch.commit();
    console.log("Blogs seeded.");

    console.log("Seeding Forum Topics...");
    batch = db.batch();
    for (const topic of mockForumTopics) {
      const ref = db.collection('forum_topics').doc(topic.id);
      batch.set(ref, topic);
    }
    await batch.commit();
    console.log("Forum Topics seeded.");

    console.log("Seeding Forum Replies...");
    batch = db.batch();
    for (const reply of mockForumReplies) {
      const ref = db.collection('forum_replies').doc(reply.id);
      batch.set(ref, reply);
    }
    await batch.commit();
    console.log("Forum Replies seeded.");

    console.log("Seeding Inmobiliarias...");
    batch = db.batch();
    const mockAgencies = [
      {
        nombre: "Inmobiliaria de Prueba 1",
        score: 85,
        quejas: 2,
        googleRating: 4.5,
        estado: "CDMX",
        imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop",
        contrato: true,
        miembroAMPI: true,
        antiguedad: 5,
        rfcStatus: "Activo",
        domicilio: true,
        controversias: "Ninguna"
      },
      {
        nombre: "Bienes Raíces Dudosos S.A.",
        score: 40,
        quejas: 15,
        googleRating: 2.1,
        estado: "Jalisco",
        imageUrl: "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?q=80&w=2070&auto=format&fit=crop",
        contrato: false,
        miembroAMPI: false,
        antiguedad: 1,
        rfcStatus: "No localizado",
        domicilio: false,
        controversias: "Múltiples demandas"
      }
    ];
    for (const agency of mockAgencies) {
      const ref = db.collection('inmobiliarias').doc();
      batch.set(ref, agency);
    }
    await batch.commit();
    console.log("Inmobiliarias seeded.");

    console.log("All done!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
}

seed();
