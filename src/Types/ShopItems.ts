export enum ShopItems {
    Shield = 1,
    ShieldPenetrator = 2,
};

export type ShopItem = {
    id: number,
    name: string,
    price: number,
    description: string,
}