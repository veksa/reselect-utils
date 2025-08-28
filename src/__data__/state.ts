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

export type Document = {
    id: number;
    messageId: number;
    data: number[];
};

export type PersonState = {
    currentPersonId?: number;
    data: Record<number, Person>;
};

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
        data: {
            1: {
                id: 1,
                name: 'M Poppins',
                firstName: 'Marry',
                secondName: 'Poppins',
            },
            2: {
                id: 2,
                name: 'H Potter',
                firstName: 'Harry',
                secondName: 'Potter',
            },
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
