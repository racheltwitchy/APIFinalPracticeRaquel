import { Service } from "typedi";
import { MedicalRecordRepository } from "./medical-record.repository";
import { MedicalRecord } from "./medical-record.model";
import { AuditService } from "../audit-logs/audit.service";
import { UserRepository } from "../user/user.repository";

@Service()
export class MedicalRecordService {
  constructor(
    private medicalRecordRepository: MedicalRecordRepository,
    private auditService: AuditService,
    private userRepository: UserRepository // Repositorio de usuarios
  ) {}

  async createRecord(record: MedicalRecord): Promise<number> {
    // Verificar que el paciente exista y tenga el rol correcto
    const patient = await this.userRepository.getUserById(record.patientId);
    if (!patient || patient.role !== "patient") {
      throw new Error("Invalid patient ID or the user is not a patient");
    }

    // Verificar que el doctor exista y tenga el rol correcto
    const doctor = await this.userRepository.getUserById(record.doctorId);
    if (!doctor || doctor.role !== "doctor") {
      throw new Error("Invalid doctor ID or the user is not a doctor");
    }

    // Crear el registro médico
    const recordId = await this.medicalRecordRepository.createRecord(record);

    // Registrar en logs
    await this.auditService.logAction(record.doctorId, "Created a medical record");
    return recordId;
  }

  async updateRecord(recordId: number, updates: Partial<MedicalRecord>, doctorId: number): Promise<void> {
    // Verificar que el registro existe
    const record = await this.medicalRecordRepository.getRecordById(recordId);
    if (!record) {
      throw new Error("Medical record not found");
    }

    // Verificar que el doctor que lo creó sea el que intenta actualizarlo
    if (record.doctorId !== doctorId) {
      throw new Error("Access forbidden: You can only modify your own medical records");
    }

    // Actualizar el registro médico
    await this.medicalRecordRepository.updateRecord(recordId, updates);

    // Registrar en logs
    await this.auditService.logAction(doctorId, `Updated medical record with ID: ${recordId}`);
  }

  async getMedicalRecords(userId: number, role: string): Promise<MedicalRecord[]> {
    // Si el rol es "admin", devolver todos los registros
    if (role === "admin") {
      return await this.medicalRecordRepository.getAllMedicalRecords();
    }

    // Si el rol es "patient", devolver los registros del paciente
    if (role === "patient") {
      return await this.medicalRecordRepository.getRecordsByPatient(userId);
    }

    // Si el rol es "doctor", devolver los registros asociados al doctor
    if (role === "doctor") {
      return await this.medicalRecordRepository.getRecordsByDoctor(userId);
    }

    throw new Error("Unauthorized access");
  }
}
