export class TaskCompletion {
  readonly id: string;
  readonly taskId: string;
  readonly completedByUserId: string;
  readonly completedAt: Date;
  readonly date: Date;

  constructor(params: {
    id: string;
    taskId: string;
    completedByUserId: string;
    completedAt: Date;
    date: Date;
  }) {
    this.id = params.id;
    this.taskId = params.taskId;
    this.completedByUserId = params.completedByUserId;
    this.completedAt = params.completedAt;
    this.date = params.date;
  }
}
