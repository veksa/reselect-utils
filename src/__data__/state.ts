export type Person = {
    id: number;
    firstName?: string;
    secondName?: string;
};

export type Message = {
    id: number;
    personId: number;
    date: Date;
    text: string;
};

export type Document = {
    id: number;
    messageId: number;
    data: number[];
};

export type PersonState = Record<number, Person>;

export type PersonStateSegment = {
    persons: PersonState;
};

export type MessageState = {
    currentMessageId?: number;
    unknownMessageId?: number;
    data: Record<number, Message>;
};

export type MessageStateSegment = {
    messages: MessageState;
};

export type State =
    & PersonStateSegment
    & MessageStateSegment
    & {
    documents: {
        [id: number]: Document;
    };
};

export const commonState: State = {
    persons: {
        1: {
            id: 1,
            firstName: 'Marry',
            secondName: 'Poppins',
        },
        2: {
            id: 2,
            firstName: 'Harry',
            secondName: 'Potter',
        },
    },

    messages: {
        currentMessageId: 200,
        unknownMessageId: undefined,
        data: {
            100: {
                id: 100,
                personId: 1,
                date: new Date('2018-12-29'),
                text: 'Hello',
            },
            200: {
                id: 200,
                personId: 2,
                date: new Date('2018-12-30'),
                text: 'Buy',
            },
        }
    },

    documents: {
        111: {
            id: 111,
            messageId: 100,
            data: [1, 2, 3],
        },
        222: {
            id: 222,
            messageId: 200,
            data: [4, 5, 6],
        },
    },
};
