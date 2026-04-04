import type { TaskScheduleType, TaskType } from './enums';

export class Task {
  readonly id: string;
  readonly householdId: string;
  readonly petId: string | null;
  readonly title: string;
  readonly taskType: TaskType;
  readonly scheduleType: TaskScheduleType;
  readonly createdAt: Date;

  constructor(params: {
    id: string;
    householdId: string;
    petId: string | null;
    title: string;
    taskType: TaskType;
    scheduleType: TaskScheduleType;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.householdId = params.householdId;
    this.petId = params.petId;
    this.title = params.title;
    this.taskType = params.taskType;
    this.scheduleType = params.scheduleType;
    this.createdAt = params.createdAt;
  }
}
