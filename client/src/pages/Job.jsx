import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Center,
  CircularProgress,
  Flex,
  Text,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from '@chakra-ui/react'

import React, { useState, useEffect } from "react";
import { getJobStatus } from "src/api";

import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from 'src/layouts/MainLayout';
import ErrorModal from "src/components/ErrorModal";

const steps = [
  { title: 'Queue', status: "queued", description: 'We appreciate your patience...' },
  { title: 'Crawling', status: "crawling", description: 'Visiting your website...' },
  { title: 'Report Ready', status: "completed", description: 'Your results are ready' },
];

const Job = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const navigate = useNavigate();

  const pollStatus = () => {
    getJobStatus({ jobId }).then(({ status }) => {
      setActiveStep(steps.findIndex(step => step.status === status));
    }).catch((err) => {
      setErrorMsg(err.message);
      setShowError(true);
    });
  };

  useEffect(() => {
    setMessage(steps[activeStep].description);
    if (activeStep === 2) { // Complete
      navigate(`/report?jobId=${jobId}`);
      return;
    }
  }, [activeStep]);

  useEffect(() => {
    const interval = setInterval(() => {
      pollStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const closeError = () => {
    setShowError(false);
  };

  return (
    <MainLayout>
      <ErrorModal message={errorMsg} showError={showError} closeError={closeError} />
      <Center width='100%' height='100%'>
        <Card w='60%' gap='40px'>
          <Flex justifyContent='center' alignItems='center' flexDirection='column'>
            <CircularProgress isIndeterminate size='200px' thickness='8px' color='brand.100' />
          </Flex>
          <Text
            textAlign='center'
            color='white'
            fontSize='42px'
            fontWeight='bold'>
            {message}
          </Text>
          <Stepper size='lg' index={activeStep}>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber color='white' />}
                    active={<StepNumber color='white' />}
                  />
                </StepIndicator>

                <Box flexShrink='0'>
                  <StepTitle color='white'>{step.title}</StepTitle>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>
        </Card>
      </Center>
    </MainLayout>
  );
};

export default Job;
