import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShopItem } from "./ShopItem";

describe("ShopItem", () => {
  test('отображает title и "{price} snapcoin"', () => {
    render(
      <ShopItem
        title="Рамка золотая"
        description="Описание не рендерится компонентом"
        price="200"
      />,
    );
    expect(screen.getByText("Рамка золотая")).toBeInTheDocument();
    expect(screen.getByText(/200\s*snapcoin/)).toBeInTheDocument();
  });

  test("отображает img с alt=title если imageUrl передан", () => {
    render(
      <ShopItem
        title="Рамка золотая"
        description="Описание"
        price="200"
        imageUrl="/images/frame.png"
      />,
    );
    const img = screen.getByAltText("Рамка золотая") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("/images/frame.png");
  });

  test('отображает бейдж "-50%"', () => {
    render(<ShopItem title="Товар" description="Описание" price="100" />);
    expect(screen.getByText("-50%")).toBeInTheDocument();
  });

  test("вызывает onBuy при клике на section.shop-item", () => {
    const onBuy = jest.fn();
    const { container } = render(
      <ShopItem
        title="Товар"
        description="Описание"
        price="100"
        onBuy={onBuy}
      />,
    );
    const section = container.querySelector(".shop-item") as HTMLElement;
    fireEvent.click(section);
    expect(onBuy).toHaveBeenCalledTimes(1);
  });

  test("отображает .shop-item__placeholder если imageUrl не передан и нет img", () => {
    const { container } = render(
      <ShopItem title="Товар" description="Описание" price="100" />,
    );
    expect(
      container.querySelector(".shop-item__placeholder"),
    ).toBeInTheDocument();
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  test("не бросает ошибку при клике без обработчика onBuy", () => {
    const { container } = render(
      <ShopItem title="Товар" description="Описание" price="100" />,
    );
    const section = container.querySelector(".shop-item") as HTMLElement;
    expect(() => {
      fireEvent.click(section);
    }).not.toThrow();
  });
});
