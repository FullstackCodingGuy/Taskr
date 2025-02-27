"use client";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { ClientSafeProvider, getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import GoogleIcon from "@mui/icons-material/Google";
import Typography from "@mui/material/Typography";
export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };

    fetchProviders();
  }, []);

  if (!providers) {
    return <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>Loading...</Container>;
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h5" component="h2" mb={2}>
        Sign In
      </Typography>
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => signIn(provider.id, { callbackUrl: "/" })}
          >
            Sign in with Google
          </Button>
          {/* <button onClick={() => signIn(provider.id, {callbackUrl: "/"})}>
            Sign in with {provider.name}
          </button> */}
        </div>
      ))}
    </Container>
  );
}
