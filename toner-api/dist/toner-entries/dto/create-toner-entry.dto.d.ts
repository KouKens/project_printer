export type TonerActionInput = 'REGISTER' | 'RECEIVE' | 'ISSUE' | 'DISPOSE';
export declare class CreateTonerEntryDto {
    action: TonerActionInput;
    userId: string;
    tonerId: string;
    name?: string;
    quantity?: number;
    receivedOn?: string;
}
