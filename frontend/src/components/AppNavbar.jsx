import { NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { supabase } from '../supabaseClient';

export default function AppNavbar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="md" className="border-bottom border-secondary">
      <Container>
        <Nav className="ms-auto align-items-center flex-row">
          <Nav.Link as={NavLink} to="/sky" className="me-3">Explore</Nav.Link>
          <Nav.Link as={NavLink} to="/dashboard" className="me-4">Dashboard</Nav.Link>
          <Button variant="outline-light" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}