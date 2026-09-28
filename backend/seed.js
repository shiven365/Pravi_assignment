const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./database');
const { User, Project, Asset, State } = require('./models');
const bcrypt = require('bcryptjs');

// Comprehensive list of Indian States
const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const SECTORS = ["Transportation", "Water", "Energy"];
const STATUSES = ["New", "In Progress", "Completed", "Delayed", "On Hold"];
const ASSET_STATUSES = ["Good", "Fair", "Poor", "Critical"];

// Helper to generate realistic dates
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced (all tables dropped and recreated).');

    // 1. Seed States
    const stateMap = {};
    for (const stateName of STATES) {
      const stateObj = await State.create({ name: stateName });
      stateMap[stateName] = stateObj.id;
    }

    // 2. Hash default password
    const defaultHash = await bcrypt.hash('password', 10);

    // 3. Seed Central Admin
    await User.create({
      email: 'central@govinfra.in',
      password_hash: defaultHash,
      role: 'CENTRAL_ADMIN',
      StateId: null,
      DepartmentId: null
    });

    // 4. Seed State Admins
    for (const state of STATES) {
      const emailFriendly = state.toLowerCase().replace(/\s+/g, '');
      await User.create({
        email: `admin@${emailFriendly}.govinfra.in`,
        password_hash: defaultHash,
        role: 'STATE_ADMIN',
        StateId: stateMap[state],
        DepartmentId: null
      });
    }
    
    // 4. Generate Projects
    const projects = [];
    let projIdCounter = 1;

    STATES.forEach(state => {
      const numProjects = Math.floor(Math.random() * 4) + 3;
      
      for (let i = 0; i < numProjects; i++) {
        const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        
        const prefixes = ["National", "State", "Regional", "Metropolitan", "Rural", "Central"];
        const suffixes = ["Initiative", "Expansion", "Modernization", "Development Phase II", "Network Upgradation", "Infrastructure Plan"];
        
        const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${state} ${sector} ${suffixes[Math.floor(Math.random() * suffixes.length)]} ${projIdCounter}`;
        const budget = Math.floor(Math.random() * 9500) + 500;
        
        let progress = 0;
        let spent = 0;
        if (status === 'New') {
          progress = 0; spent = 0;
        } else if (status === 'Completed') {
          progress = 100; spent = budget;
        } else {
          progress = Math.floor(Math.random() * 80) + 10;
          spent = Math.floor(budget * (progress / 100));
        }

        projects.push({
          id: `PRJ-2026-${projIdCounter.toString().padStart(3, '0')}`,
          name,
          StateId: stateMap[state],
          sector,
          budget,
          spent,
          progress,
          status,
          start_date: getRandomDate(new Date(2023, 0, 1), new Date(2025, 11, 31)).toISOString(),
          expected_completion: getRandomDate(new Date(2026, 0, 1), new Date(2030, 11, 31)).toISOString()
        });
        
        projIdCounter++;
      }
    });

    await Project.bulkCreate(projects);
    console.log(`✅ Seeded ${projects.length} projects across all states.`);

    // 5. Generate Assets
    const assets = [];
    let assetIdCounter = 1;

    projects.forEach(project => {
      const numAssets = Math.floor(Math.random() * 3) + 1;
      // find state name for naming
      const stateName = STATES.find(s => stateMap[s] === project.StateId) || 'Unknown';
      
      for (let i = 0; i < numAssets; i++) {
        const condition = ASSET_STATUSES[Math.floor(Math.random() * ASSET_STATUSES.length)];
        let healthScore = 95;
        
        if (condition === 'Good') healthScore = Math.floor(Math.random() * 15) + 85;
        else if (condition === 'Fair') healthScore = Math.floor(Math.random() * 15) + 70;
        else if (condition === 'Poor') healthScore = Math.floor(Math.random() * 20) + 50;
        else healthScore = Math.floor(Math.random() * 50);

        let status = 'Commissioned';
        if (healthScore < 50) status = 'Under Repair';
        else if (healthScore < 70) status = 'Maintenance Required';

        const types = {
          "Transportation": ["Highway Segment", "Bridge", "Railway Station", "Bus Terminal", "Tunnel"],
          "Water": ["Dam", "Reservoir", "Treatment Plant", "Pumping Station", "Canal Network"],
          "Energy": ["Power Grid", "Solar Park", "Substation", "Wind Farm", "Thermal Plant"],
          "Healthcare": ["Hospital Wing", "Research Center", "Clinic", "Oxygen Plant"],
          "Urban Development": ["Smart City Control Center", "Public Park", "Waste Management Facility", "Housing Complex"],
          "Telecommunication": ["5G Tower", "Fiber Optic Hub", "Data Center"],
          "Agriculture": ["Irrigation System", "Cold Storage", "Agri-Market Hub"]
        };

        const assetTypes = types[project.sector] || ["General Infrastructure"];
        const type = assetTypes[Math.floor(Math.random() * assetTypes.length)];
        const name = `${stateName} ${type} Alpha-${assetIdCounter}`;

        assets.push({
          id: `AST-2026-${assetIdCounter.toString().padStart(3, '0')}`,
          ProjectId: project.id,
          name,
          type,
          StateId: project.StateId,
          sector: project.sector,
          status,
          health_score: healthScore,
          last_inspection: getRandomDate(new Date(2025, 0, 1), new Date()).toISOString(),
          next_inspection_date: getRandomDate(new Date(), new Date(2026, 11, 31)).toISOString()
        });
        
        assetIdCounter++;
      }
    });

    await Asset.bulkCreate(assets);
    console.log(`✅ Seeded ${assets.length} assets mapped to projects.`);

    console.log('🎉 Massive database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit();
  }
};

seedDatabase();
