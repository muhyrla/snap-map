import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

// ─── Вспомогательный компонент-свидетель ─────────────────────────────────────

const TestConsumer: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>loading</div>;

  return (
    <div>
      <span data-testid="status">{isAuthenticated ? "auth" : "not-auth"}</span>
      <span data-testid="username">{user?.username ?? "none"}</span>
      <button
        onClick={() =>
          login({ id: 42, firstName: "Test", authDate: 0, hash: "h" })
        }
      >
        login
      </button>
      <button onClick={logout}>logout</button>
    </div>
  );
};

// ─── Тесты ───────────────────────────────────────────────────────────────────

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── Позитивные тесты ──────────────────────────────────────────────────────

  test("AuthProvider рендерится без ошибок", async () => {
    expect(() => {
      render(
        <AuthProvider>
          <div>child</div>
        </AuthProvider>,
      );
    }).not.toThrow();
    // Сбрасываем все отложенные обновления состояния из useEffect AuthProvider
    await act(async () => {});
  });

  test("после инициализации isAuthenticated=true (демо-режим автологин)", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("auth");
    });
  });

  test('user.username = "ivan_user" после инициализации', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("ivan_user");
    });
  });

  test("logout сбрасывает isAuthenticated", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    // Ждём автологина в демо-режиме
    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("auth");
    });

    fireEvent.click(screen.getByText("logout"));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("not-auth");
    });
  });

  test("login устанавливает пользователя после logout", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    // Ждём автологина, затем разлогиниваемся
    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("auth");
    });

    fireEvent.click(screen.getByText("logout"));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("not-auth");
    });

    // Логинимся через кнопку
    fireEvent.click(screen.getByText("login"));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("auth");
    });
  });

  // ── Негативные тесты ──────────────────────────────────────────────────────

  test("(негативный) useAuth вне AuthProvider бросает ошибку", () => {
    // Заглушаем вывод React об ошибке рендеринга в консоль
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });
});
