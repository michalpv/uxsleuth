import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from '@chakra-ui/react';

import LandingPage from "src/pages/Landing.jsx";
import JobPage from "src/pages/Job.jsx";
import ReportPage from "src/pages/Report.jsx";

import theme from "src/themes";

const queryClient = new QueryClient();

function App() {
  return (
    <ChakraProvider theme={theme} resetCss={false}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path={`/home`} element={<LandingPage />} />
            <Route path={`/job`} element={<JobPage />} />
            <Route path={`/report`} element={<ReportPage />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ChakraProvider>
  )
};

export default App;
