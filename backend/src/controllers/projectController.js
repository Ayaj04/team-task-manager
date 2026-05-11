const prisma = require('../prismaClient');

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: req.user.userId,
        members: {
          create: {
            userId: req.user.userId,
            role: 'admin'
          }
        }
      }
    });

    res.status(201).json({ message: 'Project created', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId: req.user.userId }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: { select: { tasks: true } }
      }
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        tasks: {
          include: {
            assignedTo: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;

    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: req.params.id,
          userId: req.user.userId
        }
      }
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admin can add members' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: req.params.id,
        userId: user.id,
        role: role || 'member'
      }
    });

    res.status(201).json({ message: 'Member added', member });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'User is already a member' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: req.params.id,
          userId: req.user.userId
        }
      }
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admin can delete' });
    }

    await prisma.task.deleteMany({ where: { projectId: req.params.id } });
    await prisma.projectMember.deleteMany({ where: { projectId: req.params.id } });
    await prisma.project.delete({ where: { id: req.params.id } });

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  addMember,
  deleteProject
};