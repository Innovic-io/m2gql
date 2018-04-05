interface ICollection {
    [collectionName: string]: object[] | object
}
declare module 'mongodb-to-graphql2' {
    export async function createFromDB(databaseURI: string, collectionName?: string, modelName?: string, companyName?: string): string

    export function createGraphQL(collectionData: ICollection | ICollection[]): string;
}
