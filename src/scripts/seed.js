const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Importer les modèles
const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

// Fonction pour se connecter à MongoDB
const connectDB = async () => {
  try {
    // Si pas de MongoDB configuré, utiliser des données en mémoire
    console.log('🔄 Génération des données de test...');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    return false;
  }
};

// Données de test pour les utilisateurs prestataires
const providerUsers = [
  {
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@eventpro.fr',
    password: 'Password123!',
    role: 'provider',
    companyName: 'EventPro Paris',
    phone: '+33 1 23 45 67 89',
    description: 'Organisateur d\'événements culturels et artistiques dans la région parisienne depuis plus de 15 ans.',
    website: 'https://eventpro-paris.fr',
    address: '123 Avenue des Champs-Élysées',
    city: 'Paris',
    postalCode: '75008',
    region: 'Île-de-France',
    country: 'FR',
    isVerified: true,
    isActive: true
  },
  {
    firstName: 'Pierre',
    lastName: 'Martin',
    email: 'pierre.martin@spectaclelyon.com',
    password: 'Password123!',
    role: 'provider',
    companyName: 'Spectacle Lyon',
    phone: '+33 4 78 90 12 34',
    description: 'Spécialiste des spectacles vivants et concerts dans la région Rhône-Alpes.',
    website: 'https://spectacle-lyon.com',
    address: '45 Rue de la République',
    city: 'Lyon',
    postalCode: '69002',
    region: 'Auvergne-Rhône-Alpes',
    country: 'FR',
    isVerified: true,
    isActive: true
  },
  {
    firstName: 'Sophie',
    lastName: 'Leroy',
    email: 'sophie.leroy@festivalsud.fr',
    password: 'Password123!',
    role: 'provider',
    companyName: 'Festival Sud',
    phone: '+33 4 91 23 45 67',
    description: 'Organisation de festivals de musique et d\'événements culturels dans le Sud de la France.',
    website: 'https://festival-sud.fr',
    address: '78 La Canebière',
    city: 'Marseille',
    postalCode: '13001',
    region: 'Provence-Alpes-Côte d\'Azur',
    country: 'FR',
    isVerified: true,
    isActive: true
  },
  {
    firstName: 'Thomas',
    lastName: 'Bourgeois',
    email: 'thomas.bourgeois@sportevent.fr',
    password: 'Password123!',
    role: 'provider',
    companyName: 'Sport Event Bordeaux',
    phone: '+33 5 56 78 90 12',
    description: 'Organisation d\'événements sportifs et compétitions dans la région bordelaise.',
    website: 'https://sport-event-bordeaux.fr',
    address: '32 Cours de l\'Intendance',
    city: 'Bordeaux',
    postalCode: '33000',
    region: 'Nouvelle-Aquitaine',
    country: 'FR',
    isVerified: true,
    isActive: true
  }
];

// Données de test pour les clients
const clientUsers = [
  {
    firstName: 'Alice',
    lastName: 'Moreau',
    email: 'alice.moreau@gmail.com',
    password: 'Password123!',
    role: 'client',
    phone: '+33 6 12 34 56 78',
    address: '15 Rue Saint-Antoine',
    city: 'Paris',
    postalCode: '75004',
    region: 'Île-de-France',
    country: 'FR',
    isActive: true
  },
  {
    firstName: 'Lucas',
    lastName: 'Bernard',
    email: 'lucas.bernard@yahoo.fr',
    password: 'Password123!',
    role: 'client',
    phone: '+33 6 98 76 54 32',
    address: '27 Rue Victor Hugo',
    city: 'Lyon',
    postalCode: '69003',
    region: 'Auvergne-Rhône-Alpes',
    country: 'FR',
    isActive: true
  }
];

// Catégories d'événements
const eventCategories = ['Concert', 'Théâtre', 'Sport', 'Conférence', 'Festival', 'Exposition'];

// Fonction pour générer des événements de test
const generateEvents = (providerId, providerName, providerCity) => {
  const events = [];
  const eventCount = Math.floor(Math.random() * 5) + 3; // 3 à 7 événements par prestataire
  
  const eventTitles = {
    Concert: [
      'Concert de Jazz sous les étoiles',
      'Soirée Rock Électrique',
      'Festival de Musique Classique',
      'Concert Acoustique Intimiste',
      'Soirée Électro Night'
    ],
    Théâtre: [
      'La Tragédie de Hamlet',
      'Comédie Moderne',
      'Spectacle d\'Improvisation',
      'Pièce Contemporaine',
      'Théâtre Musical'
    ],
    Sport: [
      'Tournoi de Tennis Local',
      'Match de Football Amical',
      'Course à Pied Caritative',
      'Compétition de Natation',
      'Marathon de la Ville'
    ],
    Conférence: [
      'Conférence Tech Innovation',
      'Séminaire Business',
      'Workshop Créativité',
      'Table Ronde Environnement',
      'Conférence Santé Bien-être'
    ],
    Festival: [
      'Festival Gastronomique',
      'Festival Arts et Métiers',
      'Festival de Rue',
      'Festival Famille',
      'Festival Culturel'
    ],
    Exposition: [
      'Exposition Art Contemporain',
      'Galerie Photo',
      'Exposition Historique',
      'Art Numérique',
      'Sculptures Modernes'
    ]
  };
  
  for (let i = 0; i < eventCount; i++) {
    const category = eventCategories[Math.floor(Math.random() * eventCategories.length)];
    const titles = eventTitles[category];
    const title = titles[Math.floor(Math.random() * titles.length)];
    
    // Dates aléatoires dans les 6 prochains mois
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 180) + 1);
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + Math.floor(Math.random() * 8) + 2);
    
    const capacity = [50, 100, 200, 300, 500, 1000][Math.floor(Math.random() * 6)];
    const price = [15, 25, 35, 50, 75, 100, 150][Math.floor(Math.random() * 7)];
    
    events.push({
      title: `${title} - ${providerCity}`,
      description: `${title} organisé par ${providerName}. Un événement exceptionnel à ne pas manquer ! Venez découvrir une expérience unique dans une ambiance conviviale et professionnelle.`,
      category,
      startDate,
      endDate,
      location: `Centre Culturel de ${providerCity}`,
      capacity,
      price,
      providerId,
      isActive: true,
      tags: [category.toLowerCase(), providerCity.toLowerCase(), 'événement', 'culture'],
      images: [`https://picsum.photos/800/600?random=${i}`],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Créé dans les 30 derniers jours
    });
  }
  
  return events;
};

// Fonction pour générer des tickets de test
const generateTickets = (events, clientUsers) => {
  const tickets = [];
  
  events.forEach(event => {
    // Générer 0 à 50% de tickets vendus
    const soldPercentage = Math.random() * 0.5;
    const ticketsSold = Math.floor(event.capacity * soldPercentage);
    
    for (let i = 0; i < ticketsSold; i++) {
      const client = clientUsers[Math.floor(Math.random() * clientUsers.length)];
      const purchaseDate = new Date(event.createdAt.getTime() + Math.floor(Math.random() * (Date.now() - event.createdAt.getTime())));
      
      tickets.push({
        eventId: event._id,
        userId: client._id,
        price: event.price,
        status: 'confirmed',
        qrCode: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        purchaseDate,
        createdAt: purchaseDate
      });
    }
  });
  
  return tickets;
};

// Fonction principale de seed
const seedDatabase = async () => {
  try {
    console.log('🌱 Début du seeding...');
    
    // Simuler la création des utilisateurs (pas de vraie DB)
    console.log('👥 Création des utilisateurs de test...');
    
    // Hash des mots de passe
    for (let user of [...providerUsers, ...clientUsers]) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      user._id = new mongoose.Types.ObjectId();
      user.createdAt = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
    }
    
    console.log(`✅ ${providerUsers.length} prestataires créés`);
    console.log(`✅ ${clientUsers.length} clients créés`);
    
    // Générer les événements
    console.log('🎭 Génération des événements...');
    const allEvents = [];
    
    providerUsers.forEach(provider => {
      const events = generateEvents(provider._id, provider.companyName, provider.city);
      events.forEach(event => {
        event._id = new mongoose.Types.ObjectId();
      });
      allEvents.push(...events);
    });
    
    console.log(`✅ ${allEvents.length} événements générés`);
    
    // Générer les tickets
    console.log('🎫 Génération des tickets...');
    const allTickets = generateTickets(allEvents, clientUsers);
    allTickets.forEach(ticket => {
      ticket._id = new mongoose.Types.ObjectId();
    });
    
    console.log(`✅ ${allTickets.length} tickets générés`);
    
    // Sauvegarder dans des fichiers JSON pour référence
    const fs = require('fs');
    const path = require('path');
    
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify([...providerUsers, ...clientUsers], null, 2));
    fs.writeFileSync(path.join(dataDir, 'events.json'), JSON.stringify(allEvents, null, 2));
    fs.writeFileSync(path.join(dataDir, 'tickets.json'), JSON.stringify(allTickets, null, 2));
    
    console.log('💾 Données sauvegardées dans le dossier /data');
    
    // Afficher un résumé
    console.log('\n📊 RÉSUMÉ DES DONNÉES GÉNÉRÉES:');
    console.log('=====================================');
    console.log(`👥 Utilisateurs: ${providerUsers.length + clientUsers.length}`);
    console.log(`   - Prestataires: ${providerUsers.length}`);
    console.log(`   - Clients: ${clientUsers.length}`);
    console.log(`🎭 Événements: ${allEvents.length}`);
    console.log(`🎫 Tickets vendus: ${allTickets.length}`);
    
    // Statistiques par prestataire
    console.log('\n📈 STATISTIQUES PAR PRESTATAIRE:');
    console.log('=====================================');
    providerUsers.forEach(provider => {
      const providerEvents = allEvents.filter(e => e.providerId.toString() === provider._id.toString());
      const providerTickets = allTickets.filter(t => {
        const event = allEvents.find(e => e._id.toString() === t.eventId.toString());
        return event && event.providerId.toString() === provider._id.toString();
      });
      const revenue = providerTickets.reduce((sum, ticket) => sum + ticket.price, 0);
      
      console.log(`🏢 ${provider.companyName} (${provider.city})`);
      console.log(`   Email: ${provider.email}`);
      console.log(`   Événements: ${providerEvents.length}`);
      console.log(`   Tickets vendus: ${providerTickets.length}`);
      console.log(`   Revenus: ${revenue}€\n`);
    });
    
    console.log('🎉 Seeding terminé avec succès !');
    console.log('\n🚀 Vous pouvez maintenant tester l\'application avec ces comptes:');
    console.log('=====================================');
    console.log('PRESTATAIRES:');
    providerUsers.forEach(provider => {
      console.log(`- ${provider.email} / Password123!`);
    });
    console.log('\nCLIENTS:');
    clientUsers.forEach(client => {
      console.log(`- ${client.email} / Password123!`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
};

// Exécuter le script si appelé directement
if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, providerUsers, clientUsers };