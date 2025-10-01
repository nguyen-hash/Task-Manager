import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'prisma/prisma.service';
import { TaskStatus } from '@prisma/client';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class TaskService {

  constructor(
    private readonly prisma: PrismaService,
    private redisService: RedisService,
  ) { }

  async create(data: CreateTaskDto) {
    return this.prisma.task.create({ data });
  }

  async findAll(status?: TaskStatus) {
    return this.prisma.task.findMany({
      where: status ? { status } : {},
    });
  }

  async update(id: string, data: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found!');

    return this.prisma.task.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) throw new NotFoundException('Task not found!');

    await this.prisma.task.delete({ where: { id } })
    return { message: 'Task deleted successfully!' };
  }

  async markCompleted(id: string) {
    return this.prisma.task.update({
      where: { id },
      data: { status: TaskStatus.DONE },
    });
  }

  async getPopularTasks() {
    const cacheKey = 'popular_tasks';

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log("From Cache");
      return cached;
    }

    const tasks = await this.prisma.task.findMany({
      orderBy: [
        { priority: 'desc' },
        { views: 'desc' }
      ],
      take: 5,
    });

    await this.redisService.set(cacheKey, tasks, 60);
    
    console.log("From DB, cached now");
    return tasks;
  }

}
