import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

jest.mock("./contexts/AuthContext", () => {
  const React = require("react");
  const mockContextValue = {
    user: { id: 1, firstName: "Иван", username: "ivan_user" },
    isAuthenticated: true,
    isLoading: false,
    initDataRaw: null,
    login: jest.fn(),
    logout: jest.fn(),
  };
  return {
    __esModule: true,
    AuthProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useAuth: () => mockContextValue,
  };
});

(global as any).alert = jest.fn();
(global as any).confirm = jest.fn(() => false);

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("(+) по умолчанию отображается домашний экран", async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector(".feed")).toBeInTheDocument();
    });
  });

  test("(+) панель навигации .tabbar всегда отображается", () => {
    const { container } = render(<App />);
    expect(container.querySelector(".tabbar")).toBeInTheDocument();
  });

  test("(+) клик на Stars переходит на QuestsPage", async () => {
    render(<App />);
    fireEvent.click(screen.getByAltText("Stars"));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /daily/i }),
      ).toBeInTheDocument();
    });
  });

  test("(+) клик на Leaderboard переходит на страницу лидеров", async () => {
    render(<App />);
    fireEvent.click(screen.getByAltText("Leaderboard"));
    await waitFor(() => {
      expect(screen.getByText("Глобальный")).toBeInTheDocument();
    });
  });

  test("(+) клик на Home возвращает на домашний экран", async () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByAltText("Stars"));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /daily/i }),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByAltText("Home"));
    await waitFor(() => {
      expect(container.querySelector(".feed")).toBeInTheDocument();
    });
  });

  test("(-) на домашнем экране нет кнопок Daily/Weekly", async () => {
    render(<App />);
    // Ждём загрузки ленты: тег поста 'Синий цветок' появляется только после загрузки
    await waitFor(() => {
      expect(screen.getByText("Синий цветок")).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /daily/i })).toBeNull();
  });

  test('(-) на домашнем экране нет кнопки "Глобальный"', () => {
    render(<App />);
    expect(screen.queryByText("Глобальный")).toBeNull();
  });
});
