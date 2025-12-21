export class CustomerCommentResponseDto {
  id: number;
  content: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<CustomerCommentResponseDto>) {
    Object.assign(this, partial);
  }
}
