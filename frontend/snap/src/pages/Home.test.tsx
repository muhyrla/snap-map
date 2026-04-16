import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import Home from "./Home";

describe("Home", () => {
  test("(+) отображает элемент .header", async () => {
    const { container } = render(<Home />);
    expect(container.querySelector(".header")).toBeInTheDocument();
    await act(async () => {});
  });

  test("(+) отображает блок .feed", async () => {
    const { container } = render(<Home />);
    expect(container.querySelector(".feed")).toBeInTheDocument();
    await act(async () => {});
  });

  test("(+) после загрузки показывает посты", async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getAllByText("Пользователь").length).toBeGreaterThan(0);
    });
  });

  test('(+) отображает текст "Заданий выполнено"', async () => {
    render(<Home />);
    expect(screen.getByText("Заданий выполнено")).toBeInTheDocument();
    await act(async () => {});
  });

  test('(+) отображает текст "Daily счётчик"', async () => {
    render(<Home />);
    expect(screen.getByText("Daily счётчик")).toBeInTheDocument();
    await act(async () => {});
  });

  test("(-) .feed существует, но изначально не содержит постов", async () => {
    const { container } = render(<Home />);
    const feed = container.querySelector(".feed");
    expect(feed).toBeInTheDocument();
    // Promise.resolve не разрешается синхронно внутри act() — посты ещё не загружены
    expect(feed!.querySelectorAll(".post")).toHaveLength(0);
    await act(async () => {});
  });
});
