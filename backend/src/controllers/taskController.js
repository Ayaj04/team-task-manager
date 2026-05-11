const prisma = require('../prismaClient');

const createTask = async (req, res) => {
  try {
    const { title, description, assignedToId, dueDate } = req.body;
    const { id: projectId } = req.params;

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.userId } }
    });
    if (!member) return res.status(403).json({ message: 'Not a project member' });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assignedToId: assignedToId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: req.user.userId
      }
    });

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { id: projectId } = req.params;

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.userId } }
    });
    if (!member) return res.status(403).json({ message: 'Not a project member' });

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, assignedToId, dueDate } = req.body;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.userId } }
    });

    const isAdmin = member && member.role === 'admin';
    const isAssignee = task.assignedToId === req.user.userId;

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title || task.title,
        description: description !== undefined ? description : task.description,
        status: status || task.status,
        assignedToId: assignedToId !== undefined ? assignedToId : task.assignedToId,
        dueDate: dueDate ? new Date(dueDate) : task.dueDate
      }
    });

    res.json({ message: 'Task updated', task: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.userId } }
    });

    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete tasks' });
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };