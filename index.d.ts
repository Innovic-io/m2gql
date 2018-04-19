interface ICollection {
    [collectionName: string]: object[] | object
}
interface ICreateFromDB {
    databaseURI: string,
    collectionName?: string,
    modelName?: string,
    companyName?: string
}

declare module 'm2gql' {
    export function createFromDB({}: ICreateFromDB): Promise<string>
    export function createGraphQL(collectionData: ICollection | ICollection[], nullReplacement?: string): string;
}
