import { Component, ErrorInfo, ReactNode } from 'react';
import { StyledError, Box, Button } from '../styles/ErrorBoundaryStyles';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <StyledError>
          <Box>
            <h1>Oops! Something went wrong 😢</h1>
            <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
            <Button onClick={this.handleReset}>Return to Home</Button>
          </Box>
        </StyledError>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
