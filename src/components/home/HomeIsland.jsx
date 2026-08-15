import { ErrorBoundary } from "../../shared/ErrorBoundary";
import HomeApp from "./HomeApp";

export default function HomeIsland() {
  return (
    <ErrorBoundary>
      <HomeApp />
    </ErrorBoundary>
  );
}
