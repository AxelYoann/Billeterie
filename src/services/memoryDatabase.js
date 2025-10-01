const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Simulation d'une base de données en mémoire
class MemoryDatabase {
  constructor() {
    this.users = [];
    this.events = [];
    this.tickets = [];
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Créer des utilisateurs de test
    const providerUsers = [
      {
        _id: 'provider1',
        firstName: 'Marie',
        lastName: 'Dubois',
        email: 'marie.dubois@eventpro.fr',
        password: await bcrypt.hash('Password123!', 10),
        role: 'provider',
        companyName: 'EventPro Paris',
        phone: '+33 1 23 45 67 89',
        description: 'Organisateur d\'événements culturels et artistiques dans la région parisienne.',
        website: 'https://eventpro-paris.fr',
        address: '123 Avenue des Champs-Élysées',
        city: 'Paris',
        postalCode: '75008',
        region: 'Île-de-France',
        country: 'FR',
        isVerified: true,
        isActive: true,
        createdAt: new Date('2024-01-15')
      },
      {
        _id: 'provider2',
        firstName: 'Pierre',
        lastName: 'Martin',
        email: 'pierre.martin@spectaclelyon.com',
        password: await bcrypt.hash('Password123!', 10),
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
        isActive: true,
        createdAt: new Date('2024-02-20')
      },
      {
        _id: 'provider3',
        firstName: 'Sophie',
        lastName: 'Leroy',
        email: 'sophie.leroy@festivalsud.fr',
        password: await bcrypt.hash('Password123!', 10),
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
        isActive: true,
        createdAt: new Date('2024-03-10')
      }
    ];

    const clientUsers = [
      {
        _id: 'client1',
        firstName: 'Alice',
        lastName: 'Moreau',
        email: 'alice.moreau@gmail.com',
        password: await bcrypt.hash('Password123!', 10),
        role: 'client',
        phone: '+33 6 12 34 56 78',
        address: '15 Rue Saint-Antoine',
        city: 'Paris',
        postalCode: '75004',
        region: 'Île-de-France',
        country: 'FR',
        isActive: true,
        createdAt: new Date('2024-04-05')
      },
      {
        _id: 'client2',
        firstName: 'Lucas',
        lastName: 'Bernard',
        email: 'lucas.bernard@yahoo.fr',
        password: await bcrypt.hash('Password123!', 10),
        role: 'client',
        phone: '+33 6 98 76 54 32',
        address: '27 Rue Victor Hugo',
        city: 'Lyon',
        postalCode: '69003',
        region: 'Auvergne-Rhône-Alpes',
        country: 'FR',
        isActive: true,
        createdAt: new Date('2024-05-12')
      }
    ];

    this.users = [...providerUsers, ...clientUsers];

    // Créer des événements de test
    const events = [
      {
        _id: 'event1',
        title: 'Concert de Jazz sous les étoiles - Paris',
        description: 'Une soirée magique avec les meilleurs musiciens de jazz parisiens. Ambiance intimiste garantie.',
        category: 'Concert',
        startDate: new Date('2025-11-15T20:00:00'),
        endDate: new Date('2025-11-15T23:00:00'),
        location: 'Centre Culturel de Paris',
        capacity: 200,
        price: 45,
        providerId: 'provider1',
        isActive: true,
        tags: ['jazz', 'paris', 'concert', 'musique'],
        images: ['https://picsum.photos/800/600?random=1'],
        createdAt: new Date('2024-09-01')
      },
      {
        _id: 'event2',
        title: 'Pièce de Théâtre Contemporaine - Paris',
        description: 'Une pièce moderne qui questionne notre société actuelle avec humour et finesse.',
        category: 'Théâtre',
        startDate: new Date('2025-10-20T19:30:00'),
        endDate: new Date('2025-10-20T21:30:00'),
        location: 'Théâtre de la Ville - Paris',
        capacity: 150,
        price: 32,
        providerId: 'provider1',
        isActive: true,
        tags: ['théâtre', 'paris', 'contemporain'],
        images: ['https://picsum.photos/800/600?random=2'],
        createdAt: new Date('2024-08-15')
      },
      {
        _id: 'event3',
        title: 'Festival Rock Électrique - Lyon',
        description: 'Trois jours de rock avec les meilleurs groupes français et internationaux.',
        category: 'Festival',
        startDate: new Date('2025-12-01T18:00:00'),
        endDate: new Date('2025-12-03T23:59:00'),
        location: 'Parc de la Tête d\'Or - Lyon',
        capacity: 5000,
        price: 85,
        providerId: 'provider2',
        isActive: true,
        tags: ['rock', 'lyon', 'festival', 'musique'],
        images: ['https://picsum.photos/800/600?random=3'],
        createdAt: new Date('2024-07-20')
      },
      {
        _id: 'event4',
        title: 'Conférence Tech Innovation - Lyon',
        description: 'Les dernières innovations technologiques présentées par les experts du secteur.',
        category: 'Conférence',
        startDate: new Date('2025-10-25T09:00:00'),
        endDate: new Date('2025-10-25T17:00:00'),
        location: 'Centre des Congrès - Lyon',
        capacity: 300,
        price: 120,
        providerId: 'provider2',
        isActive: true,
        tags: ['tech', 'lyon', 'innovation', 'conférence'],
        images: ['https://picsum.photos/800/600?random=4'],
        createdAt: new Date('2024-08-30')
      },
      {
        _id: 'event5',
        title: 'Festival Gastronomique du Sud - Marseille',
        description: 'Découvrez les saveurs méditerranéennes avec les meilleurs chefs de la région.',
        category: 'Festival',
        startDate: new Date('2025-11-10T11:00:00'),
        endDate: new Date('2025-11-12T22:00:00'),
        location: 'Vieux Port - Marseille',
        capacity: 1000,
        price: 25,
        providerId: 'provider3',
        isActive: true,
        tags: ['gastronomie', 'marseille', 'festival', 'cuisine'],
        images: ['https://picsum.photos/800/600?random=5'],
        createdAt: new Date('2024-09-10')
      },
      {
        _id: 'event6',
        title: 'Exposition Art Contemporain - Marseille',
        description: 'Une exposition unique rassemblant les œuvres d\'artistes contemporains méditerranéens.',
        category: 'Exposition',
        startDate: new Date('2025-10-15T10:00:00'),
        endDate: new Date('2025-12-15T18:00:00'),
        location: 'Musée d\'Art Contemporain - Marseille',
        capacity: 50,
        price: 18,
        providerId: 'provider3',
        isActive: true,
        tags: ['art', 'marseille', 'exposition', 'contemporain'],
        images: ['https://picsum.photos/800/600?random=6'],
        createdAt: new Date('2024-08-05')
      }
    ];

    this.events = events;

    // Créer des tickets de test
    const tickets = [
      {
        _id: 'ticket1',
        eventId: 'event1',
        userId: 'client1',
        price: 45,
        status: 'confirmed',
        qrCode: 'QR-EVENT1-CLIENT1-001',
        purchaseDate: new Date('2024-09-15'),
        createdAt: new Date('2024-09-15')
      },
      {
        _id: 'ticket2',
        eventId: 'event1',
        userId: 'client2',
        price: 45,
        status: 'confirmed',
        qrCode: 'QR-EVENT1-CLIENT2-002',
        purchaseDate: new Date('2024-09-18'),
        createdAt: new Date('2024-09-18')
      },
      {
        _id: 'ticket3',
        eventId: 'event3',
        userId: 'client1',
        price: 85,
        status: 'confirmed',
        qrCode: 'QR-EVENT3-CLIENT1-003',
        purchaseDate: new Date('2024-09-20'),
        createdAt: new Date('2024-09-20')
      },
      {
        _id: 'ticket4',
        eventId: 'event5',
        userId: 'client2',
        price: 25,
        status: 'confirmed',
        qrCode: 'QR-EVENT5-CLIENT2-004',
        purchaseDate: new Date('2024-09-25'),
        createdAt: new Date('2024-09-25')
      },
      // Plus de tickets pour les statistiques
      ...Array.from({ length: 20 }, (_, i) => ({
        _id: `ticket_${i + 5}`,
        eventId: events[i % events.length]._id,
        userId: i % 2 === 0 ? 'client1' : 'client2',
        price: events[i % events.length].price,
        status: 'confirmed',
        qrCode: `QR-RANDOM-${i + 5}`,
        purchaseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }))
    ];

    this.tickets = tickets;
    this.initialized = true;

    console.log('💾 Base de données mémoire initialisée:');
    console.log(`   - ${this.users.length} utilisateurs`);
    console.log(`   - ${this.events.length} événements`);
    console.log(`   - ${this.tickets.length} tickets`);
  }

  // Méthodes pour simuler les modèles Mongoose
  async findUser(query) {
    await this.initialize();
    if (query.email) {
      return this.users.find(user => user.email === query.email);
    }
    if (query._id || query.id) {
      const id = query._id || query.id;
      return this.users.find(user => user._id === id);
    }
    return this.users.find(user => {
      return Object.keys(query).every(key => user[key] === query[key]);
    });
  }

  async findUserById(id) {
    await this.initialize();
    return this.users.find(user => user._id === id);
  }

  async createUser(userData) {
    await this.initialize();
    const newUser = {
      _id: 'user_' + Date.now(),
      ...userData,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async findEvents(query = {}) {
    await this.initialize();
    let filteredEvents = [...this.events];

    if (query.providerId) {
      filteredEvents = filteredEvents.filter(event => event.providerId === query.providerId);
    }

    return {
      sort: () => ({
        exec: () => Promise.resolve(filteredEvents)
      }),
      exec: () => Promise.resolve(filteredEvents)
    };
  }

  async findEventById(id) {
    await this.initialize();
    return this.events.find(event => event._id === id);
  }

  async findTickets(query = {}) {
    await this.initialize();
    let filteredTickets = [...this.tickets];

    if (query.eventId && query.eventId.$in) {
      filteredTickets = filteredTickets.filter(ticket => 
        query.eventId.$in.includes(ticket.eventId)
      );
    } else if (query.eventId) {
      filteredTickets = filteredTickets.filter(ticket => ticket.eventId === query.eventId);
    }

    if (query.userId) {
      filteredTickets = filteredTickets.filter(ticket => ticket.userId === query.userId);
    }

    if (query.createdAt && query.createdAt.$gte) {
      filteredTickets = filteredTickets.filter(ticket => 
        new Date(ticket.createdAt) >= query.createdAt.$gte
      );
    }

    return filteredTickets;
  }

  async countTickets(query = {}) {
    const tickets = await this.findTickets(query);
    return tickets.length;
  }

  // Méthode pour authentifier un utilisateur
  async authenticateUser(email, password) {
    await this.initialize();
    const user = await this.findUser({ email });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    // Créer un token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    return { user: { ...user, password: undefined }, token };
  }

  // Méthode pour créer un nouvel utilisateur
  async registerUser(userData) {
    await this.initialize();
    
    // Vérifier si l'email existe déjà
    const existingUser = await this.findUser({ email: userData.email });
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Créer l'utilisateur
    const newUser = await this.createUser({
      ...userData,
      password: hashedPassword
    });

    // Créer un token JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    return { user: { ...newUser, password: undefined }, token };
  }
}

// Instance globale de la base de données mémoire
const memoryDB = new MemoryDatabase();

module.exports = memoryDB;