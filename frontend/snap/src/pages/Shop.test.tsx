import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import Shop from "./Shop";

jest.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, firstName: "Иван", username: "ivan" },
    logout: jest.fn(),
  }),
}));

(global as any).alert = jest.fn();
(global as any).confirm = jest.fn(() => true);

describe("Shop", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('(+) сразу после render показывает "Загрузка..."', async () => {
    render(<Shop />);
    expect(screen.getByText("Загрузка...")).toBeInTheDocument();
    await act(async () => {});
  });

  test("(+) после загрузки отображаются товары", async () => {
    render(<Shop />);
    await waitFor(() => {
      expect(screen.getAllByText(/стим ключ ура/i).length).toBeGreaterThan(0);
    });
  });

  test("(+) отображается ровно 4 товара", async () => {
    render(<Shop />);
    await waitFor(() => {
      expect(screen.getAllByText(/стим ключ ура/i)).toHaveLength(4);
    });
  });

  test("(+) клик на shop-item вызывает alert", async () => {
    const { container } = render(<Shop />);
    await waitFor(() => {
      expect(screen.getAllByText(/стим ключ ура/i).length).toBeGreaterThan(0);
    });
    const firstItem = container.querySelectorAll(
      ".shop-item",
    )[0] as HTMLElement;
    fireEvent.click(firstItem);
    await waitFor(() => {
      expect((global as any).alert).toHaveBeenCalled();
    });
  });

  test("(-) во время загрузки товары не отображаются", async () => {
    render(<Shop />);
    expect(screen.queryByText(/стим ключ ура/i)).toBeNull();
    await act(async () => {});
  });
});
