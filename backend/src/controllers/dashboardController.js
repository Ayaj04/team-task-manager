const prisma = require('../prismaClient');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();

    // Get all projects user is member of
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId } } },
      select: { id: true, name: true }
    });

    const projectIds = projects.map(p => p.id);

    // Total tasks across all projects
    const totalTasks = await prisma.task.count({
      where: { projectId: { in: projectIds } }
    });

    // Tasks by status
    const todoTasks = await prisma.task.count({
      where: { projectId: { in: projectIds }, status: 'todo' }
    });

    const inProgressTasks = await prisma.task.count({
      where: { projectId: { in: projectIds }, status: 'in-progress' }
    });

    const doneTasks = await prisma.task.count({
      where: { projectId: { in: projectIds }, status: 'done' }
    });

    // Overdue tasks (dueDate passed and not done)
    const overdueTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: { not: 'done' },
        dueDate: { lt: now }
      }
    });

    // My assigned tasks
    const myTasks = await prisma.task.findMany({
      where: { assignedToId: userId },
      include: {
        project: { select: { id: true, name: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json({
      stats: {
        totalProjects: projects.length,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks
      },
      projects,
      myTasks
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboard };