import { Request, Response } from 'express';
import { AppointmentService } from './appointment.service';

export class AppointmentController {
  private appointmentService = new AppointmentService();

  public createAppointment = async (req: Request, res: Response) => {
    try {
      const appointment = await this.appointmentService.createAppointment(req.body);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  public getAppointmentById = async (req: Request, res: Response) => {
    try {
      const appointment = await this.appointmentService.getAppointmentById(req.params.id);
      res.status(200).json(appointment);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };

  public updateAppointment = async (req: Request, res: Response) => {
    try {
      const updatedAppointment = await this.appointmentService.updateAppointment(req.params.id, req.body);
      res.status(200).json(updatedAppointment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  public deleteAppointment = async (req: Request, res: Response) => {
    try {
      await this.appointmentService.deleteAppointment(req.params.id);
      res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };
}
