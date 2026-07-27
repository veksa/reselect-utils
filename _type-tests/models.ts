export type Person = {
  id: number;
  name?: string;
  firstName?: string;
  secondName?: string;
};

export type Message = {
  id: number;
  personId: number;
  date: Date;
  text: string;
};

export type PersonState = {
  currentPersonId?: number;
  data: Record<number, Person>;
};

export type MessageState = {
  currentMessageId?: number;
  data: Record<number, Message>;
};

export type State = {
  persons: PersonState;
  messages: MessageState;
};

export type PersonProps = {
  personId: number;
};

export type MessageProps = {
  messageId: number;
};

export type DocumentProps = {
  documentId: number;
};
