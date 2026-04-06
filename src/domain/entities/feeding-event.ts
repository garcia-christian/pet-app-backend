export class FeedingEvent {
  readonly id: string;
  readonly petId: string;
  readonly mealScheduleId: string;
  readonly userId: string;
  readonly fedAt: Date;
  readonly remarks: string | null;
  readonly createdAt: Date;

  constructor(params: {
    id: string;
    petId: string;
    mealScheduleId: string;
    userId: string;
    fedAt: Date;
    remarks: string | null;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.petId = params.petId;
    this.mealScheduleId = params.mealScheduleId;
    this.userId = params.userId;
    this.fedAt = params.fedAt;
    this.remarks = params.remarks;
    this.createdAt = params.createdAt;
  }
}
