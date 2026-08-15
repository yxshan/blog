import { ErrorBoundary } from "../../shared/ErrorBoundary";
import { errorMonitoring } from "../../integrations/errors/glitchtipReporter";
import HomeApp from "./HomeApp";

export default function HomeIsland() {
  return (
    <ErrorBoundary
      reporter={errorMonitoring.enabled ? errorMonitoring.reporter : undefined}
    >
      <HomeApp />
    </ErrorBoundary>
  );
}
