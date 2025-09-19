import { IsNotEmpty, IsString } from "class-validator";

export class CreateTaskDto {

    @IsString()
    @IsNotEmpty({ message: 'Title cannot be empty!'})
    title: string;

    description: string;
    due_date?: Date;
}
