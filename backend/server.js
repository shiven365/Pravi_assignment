const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { State, Department, User, Project, Asset, AuditLog, sequelize } = require('./models');
const { authenticateToken, generateAccessToken } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Init Demo Data
async function initDb() {
  await sequelize.sync({ force: true });
  
  const gujarat = await State.create({ name: 'Gujarat' });
  const maharashtra = await State.create({ name: 'Maharashtra' });
  
  const water = await Department.create({ name: 'Water Resources', StateId: gujarat.id });
  const roads = await Department.create({ name: 'Roads & Buildings', StateId: gujarat.id });

  const hash = await bcrypt.hash('password', 10);
  
  await User.create({ name: 'Central Infrastructure Administrator', email: 'central.admin@govinfra.demo', password_hash: hash, role: 'CENTRAL_ADMIN' });
  await User.create({ name: 'Gujarat Infrastructure Administrator', email: 'gujarat.admin@govinfra.demo', password_hash: hash, role: 'STATE_ADMIN', StateId: gujarat.id });
  await User.create({ name: 'Maharashtra Infrastructure Administrator', email: 'maharashtra.admin@govinfra.demo', password_hash: hash, role: 'STATE_ADMIN', StateId: maharashtra.id });
  await User.create({ name: 'Gujarat Water Authority', email: 'gujarat.water@govinfra.demo', password_hash: hash, role: 'DEPARTMENT_ADMIN', StateId: gujarat.id, DepartmentId: water.id });

  await Project.create({ id: 'PRJ-2024-01', name: 'Coastal Highway Phase 1', sector: 'Transportation', StateId: maharashtra.id, budget: 15000, spent: 12500, progress: 60, status: 'Delayed', start_date: '2020-01-10', expected_completion: '2024-12-30' });
  await Project.create({ id: 'PRJ-2024-02', name: 'Kutch Solar Expansion', sector: 'Energy', StateId: gujarat.id, budget: 500, spent: 400, progress: 85, status: 'On Track', start_date: '2023-05-01', expected_completion: '2024-08-15' });
  await Project.create({ id: 'PRJ-2024-03', name: 'Narmada Canal Extension', sector: 'Water', StateId: gujarat.id, DepartmentId: water.id, budget: 2000, spent: 100, progress: 5, status: 'New', start_date: '2024-02-20', expected_completion: '2027-12-31' });

  await Asset.create({ id: 'AST-2024-001', name: 'Mumbai Coastal Road', type: 'Highway', sector: 'Transportation', StateId: maharashtra.id, ProjectId: 'PRJ-2024-01', cost: '12721', health_score: 92, status: 'Commissioned' });
  await Asset.create({ id: 'AST-2024-042', name: 'Narmada Pump', type: 'Water Pump', sector: 'Water', StateId: gujarat.id, DepartmentId: water.id, health_score: 45, status: 'Maintenance Required' });
}

// Initialization is now handled by seed.js

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { email: username } });
  
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ detail: 'Incorrect email or password' });
  }

  const payload = { user_id: user.id, role: user.role, state_id: user.StateId, department_id: user.DepartmentId };
  const token = generateAccessToken(payload);
  
  res.json({
    access_token: token,
    token_type: 'bearer',
    user: { id: user.id, name: user.name, email: user.email, role: user.role, state_id: user.StateId, department_id: user.DepartmentId }
  });
});

app.get('/api/public/projects', async (req, res) => {
  const projects = await Project.findAll({ include: [{ model: State, attributes: ['name'] }] });
  const mapped = projects.map(p => ({
    ...p.toJSON(),
    state_name: p.State ? p.State.name : 'Unknown'
  }));
  res.json(mapped);
});

app.get('/api/public/projects/:id', async (req, res) => {
  const project = await Project.findByPk(req.params.id, { include: [{ model: State, attributes: ['name'] }] });
  if (!project) return res.status(404).json({ detail: 'Project not found' });
  
  const assets = await Asset.findAll({ where: { ProjectId: project.id } });
  
  res.json({
    ...project.toJSON(),
    state_name: project.State ? project.State.name : 'Unknown',
    assets: assets
  });
});

app.get('/api/public/assets', async (req, res) => {
  const assets = await Asset.findAll({ include: [{ model: State, attributes: ['name'] }] });
  const mapped = assets.map(a => ({
    ...a.toJSON(),
    state_name: a.State ? a.State.name : 'Unknown'
  }));
  res.json(mapped);
});

app.get('/api/admin/projects', authenticateToken, async (req, res) => {
  let where = {};
  if (req.user.role === 'STATE_ADMIN') where.StateId = req.user.state_id;
  if (req.user.role === 'DEPARTMENT_ADMIN') {
    where.StateId = req.user.state_id;
    where.DepartmentId = req.user.department_id;
  }
  const projects = await Project.findAll({ 
    where,
    include: [{ model: State, attributes: ['name'] }]
  });
  // Map properties back to what the frontend expects
  const mapped = projects.map(p => ({
    ...p.toJSON(),
    state_id: p.StateId,
    state_name: p.State ? p.State.name : 'Unknown',
    department_id: p.DepartmentId
  }));
  res.json(mapped);
});

app.put('/api/admin/projects/:id', authenticateToken, async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).json({ detail: 'Project not found' });

  if (req.user.role !== 'CENTRAL_ADMIN') {
    if (project.StateId !== req.user.state_id) {
      return res.status(403).json({ detail: 'You do not have permission to modify resources outside your assigned state.' });
    }
    if (req.user.role === 'DEPARTMENT_ADMIN' && project.DepartmentId !== req.user.department_id) {
      return res.status(403).json({ detail: 'You do not have permission to modify resources outside your assigned department.' });
    }
  }

  const { progress, status, spent, expected_completion, reason } = req.body;
  const oldData = `Progress: ${project.progress}, Status: ${project.status}, Spent: ${project.spent}`;
  
  if (progress !== undefined) project.progress = progress;
  if (status !== undefined) project.status = status;
  if (spent !== undefined) project.spent = spent;
  if (expected_completion !== undefined) project.expected_completion = expected_completion;
  
  await project.save();
  
  const newData = `Progress: ${project.progress}, Status: ${project.status}, Spent: ${project.spent}`;
  
  const user = await User.findByPk(req.user.user_id);
  
  await AuditLog.create({
    UserId: user.id,
    user_name_snapshot: user.name,
    user_role: user.role,
    StateId: req.user.state_id,
    DepartmentId: req.user.department_id,
    action: 'PROJECT_UPDATED',
    entity_type: 'Project',
    entity_id: project.id,
    old_data: oldData,
    new_data: newData,
    reason: reason
  });

  res.json({
      ...project.toJSON(),
      state_id: project.StateId,
      department_id: project.DepartmentId
  });
});

app.get('/api/admin/assets', authenticateToken, async (req, res) => {
  let where = {};
  if (req.user.role === 'STATE_ADMIN') where.StateId = req.user.state_id;
  if (req.user.role === 'DEPARTMENT_ADMIN') {
    where.StateId = req.user.state_id;
    where.DepartmentId = req.user.department_id;
  }
  const assets = await Asset.findAll({ 
    where,
    include: [{ model: State, attributes: ['name'] }]
  });
  
  const mapped = assets.map(a => ({
    ...a.toJSON(),
    state_id: a.StateId,
    state_name: a.State ? a.State.name : 'Unknown',
    department_id: a.DepartmentId
  }));
  res.json(mapped);
});

app.put('/api/admin/assets/:id', authenticateToken, async (req, res) => {
  const asset = await Asset.findByPk(req.params.id);
  if (!asset) return res.status(404).json({ detail: 'Asset not found' });

  if (req.user.role !== 'CENTRAL_ADMIN') {
    if (asset.StateId !== req.user.state_id) {
      return res.status(403).json({ detail: 'You do not have permission to modify resources outside your assigned state.' });
    }
    if (req.user.role === 'DEPARTMENT_ADMIN' && asset.DepartmentId !== req.user.department_id) {
      return res.status(403).json({ detail: 'You do not have permission to modify resources outside your assigned department.' });
    }
  }

  const { status, healthScore, reason, next_inspection_date } = req.body;
  const oldData = `Health Score: ${asset.health_score}, Status: ${asset.status}, Next Inspection: ${asset.next_inspection_date}`;
  
  if (status !== undefined) asset.status = status;
  if (healthScore !== undefined) asset.health_score = healthScore;
  if (next_inspection_date !== undefined) asset.next_inspection_date = next_inspection_date;
  
  await asset.save();
  
  const newData = `Health Score: ${asset.health_score}, Status: ${asset.status}, Next Inspection: ${asset.next_inspection_date}`;
  const user = await User.findByPk(req.user.user_id);
  
  await AuditLog.create({
    UserId: user.id,
    user_name_snapshot: user.name,
    user_role: user.role,
    StateId: req.user.state_id,
    DepartmentId: req.user.department_id,
    action: 'ASSET_UPDATED',
    entity_type: 'Asset',
    entity_id: asset.id,
    old_data: oldData,
    new_data: newData,
    reason: reason
  });

  res.json(asset);
});

app.listen(8000, () => console.log('Server running on port 8000'));
