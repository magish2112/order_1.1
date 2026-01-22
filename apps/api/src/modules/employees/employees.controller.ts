import { FastifyRequest, FastifyReply } from 'fastify';
import employeesService from './employees.service';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  getEmployeesQuerySchema,
} from './employees.schema';

export class EmployeesController {
  async getEmployees(
    request: FastifyRequest<{ Querystring: unknown }>,
    reply: FastifyReply
  ) {
    const query = getEmployeesQuerySchema.parse(request.query);
    const employees = await employeesService.getEmployees(query);

    return reply.status(200).send({
      success: true,
      data: employees,
    });
  }

  async getEmployeeById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const employee = await employeesService.getEmployeeById(id);

    if (!employee) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Сотрудник не найден',
      });
    }

    return reply.status(200).send({
      success: true,
      data: employee,
    });
  }

  async createEmployee(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = createEmployeeSchema.parse(request.body);
    const employee = await employeesService.createEmployee(validated);

    return reply.status(201).send({
      success: true,
      data: employee,
    });
  }

  async updateEmployee(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const body = request.body as Record<string, unknown>;
    const validated = updateEmployeeSchema.parse({ ...body, id });
    const employee = await employeesService.updateEmployee(validated);

    return reply.status(200).send({
      success: true,
      data: employee,
    });
  }

  async deleteEmployee(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    await employeesService.deleteEmployee(id);

    return reply.status(200).send({
      success: true,
      message: 'Сотрудник удален',
    });
  }
}

export default new EmployeesController();

