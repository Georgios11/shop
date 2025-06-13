import {
  Article,
  Section,
  InfoContainer,
  DocumentationLink,
  LoginInstructions,
  AccountList,
  AccountItem,
  ResetInfo,
  WarningMessage,
} from '../styles/HomeStyles';
import Heading from '../ui/Heading';
import Button from '../ui/Button';
import { useSeed } from '../hooks/useSeed';
import SpinnerMini from '../ui/SpinnerMini';

const Home = () => {
  const { handleSeed, error, isLoading } = useSeed();

  const getHeadingText = () => {
    if (isLoading) return null;
    if (error) return error;

    return null;
  };

  const getButtonText = () => {
    if (error) return 'Try Again';
    if (isLoading) return 'Seeding...';
    return 'Reset database';
  };

  return (
    <Section data-testid="home-page">
      <Article>
        <Heading as="h3">Welcome to my shop!</Heading>
        <InfoContainer>
          <p>
            For detailed information about the project, please check the{' '}
            <DocumentationLink
              href="https://github.com/Georgios11/shop/blob/main/Readme.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation
            </DocumentationLink>
            .
          </p>
        </InfoContainer>
        <LoginInstructions>
          <h4>Login Instructions</h4>
          <p>You can use the following accounts to test the application:</p>
          <AccountList>
            <AccountItem>
              <strong>Admin Account:</strong>
              <br />
              Email: admin@email.com
              <br />
              Password: 121212
            </AccountItem>
            <AccountItem>
              <strong>Regular User Account:</strong>
              <br />
              Email: user2@email.com
              <br />
              Password: 121212
            </AccountItem>
            <AccountItem>
              <strong>Banned User Account:</strong>
              <br />
              Email: user@email.com
              <br />
              Password: 121212
            </AccountItem>
            <AccountItem>
              <strong>Register Your Own Account:</strong>
              <br />
              You can also register using your own email address to create a new
              account.
              <br />
              Click the &quot;Register&quot; button in the navigation bar to get
              started.
            </AccountItem>
          </AccountList>
        </LoginInstructions>
        <ResetInfo>
          <p>
            If you are experiencing weird behavior, or you want to start with
            fresh data, please reset the database.
          </p>
          <WarningMessage>
            ⚠️ Warning: Please make sure you are logged out before resetting the
            database. Resetting while logged in may cause unexpected behavior
            and affect other users&apos; sessions. For safety, please log out
            first and only reset during off-peak hours.
          </WarningMessage>
        </ResetInfo>

        {isLoading && <SpinnerMini />}
        <Heading as="h3">{getHeadingText()}</Heading>
        <Button onClick={() => void handleSeed()} disabled={isLoading}>
          {getButtonText()}
        </Button>
      </Article>
    </Section>
  );
};

export default Home;
