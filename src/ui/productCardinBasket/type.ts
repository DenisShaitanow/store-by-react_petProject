type Category =
  | "t-shirts"
  | "shoes"
  | "trousers"
  | "jackets"
  | "hats"
  | "underwear"
  | "accessories";

export interface IProduct {
  id: string;
  price: number;
  title: string;
  description: string;
  image: string;
  shortDescription: string;
  category: Category;
  sex: "man" | "woman";
  className?: string;
  isLiked: boolean;
}

export interface Props {
  card: IProduct;
  count: number;
}
