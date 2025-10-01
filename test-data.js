const memoryDB = require('./src/services/memoryDatabase');

async function testData() {
  console.log('🧪 Test des données en mémoire...\n');
  
  // Initialiser la base de données
  await memoryDB.initialize();
  
  // Tester les utilisateurs
  console.log('👥 UTILISATEURS:');
  console.log(`Total: ${memoryDB.users.length}`);
  const providers = memoryDB.users.filter(u => u.role === 'provider');
  const clients = memoryDB.users.filter(u => u.role === 'client');
  console.log(`Prestataires: ${providers.length}`);
  console.log(`Clients: ${clients.length}\n`);
  
  // Tester les événements
  console.log('🎭 ÉVÉNEMENTS:');
  console.log(`Total: ${memoryDB.events.length}`);
  
  providers.forEach(provider => {
    const providerEvents = memoryDB.events.filter(e => e.providerId === provider._id);
    console.log(`${provider.companyName}: ${providerEvents.length} événements`);
  });
  console.log('');
  
  // Tester les tickets
  console.log('🎫 TICKETS:');
  console.log(`Total: ${memoryDB.tickets.length}`);
  
  providers.forEach(provider => {
    const providerEvents = memoryDB.events.filter(e => e.providerId === provider._id);
    const providerTickets = memoryDB.tickets.filter(t => {
      const event = memoryDB.events.find(e => e._id === t.eventId);
      return event && event.providerId === provider._id;
    });
    const revenue = providerTickets.reduce((sum, ticket) => sum + ticket.price, 0);
    
    console.log(`${provider.companyName}: ${providerTickets.length} tickets, ${revenue}€ de revenus`);
  });
  
  console.log('\n✅ Test terminé - Données disponibles pour l\'application !');
}

testData().catch(console.error);