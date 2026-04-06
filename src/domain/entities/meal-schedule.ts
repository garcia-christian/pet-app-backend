export class MealSchedule {
  readonly id: string;
  readonly petId: string;
  readonly mealName: string;
  readonly scheduledTime: string;
  readonly graceMinutes: number;
  readonly createdAt: Date;

  constructor(params: {
    id: string;
    petId: string;
    mealName: string;
    scheduledTime: string;
    graceMinutes: number;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.petId = params.petId;
    this.mealName = params.mealName;
    this.scheduledTime = params.scheduledTime;
    this.graceMinutes = params.graceMinutes;
    this.createdAt = params.createdAt;
  }
}
