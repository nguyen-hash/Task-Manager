import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TaskService {

  constructor(private readonly prisma: PrismaService) { }

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

}
