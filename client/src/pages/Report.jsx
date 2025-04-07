import {
  Box,
  Center,
  ChakraProvider,
  CircularProgress,
  Code,
  Flex,
  IconButton,
  Image,
  Text,
  Spinner,
  Link,
  ListItem,
  OrderedList,
  UnorderedList,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react'
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';

import React, { useState } from "react";
import { useQuery } from "react-query";
import { getReportData } from "src/api";

import { useSearchParams } from "react-router-dom";
import ErrorModal from "src/components/ErrorModal";
import MainLayout from 'src/layouts/MainLayout';
import Markdown from 'react-markdown';

const Report = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);

  const { data: report, status } = useQuery(
    "reports",
    async () => {
      return await getReportData({ jobId });
    },
    {
      onError: (err) => {
        setErrorMsg(err.message);
        setShowError(true);
      }
    }
  );

  const closeError = () => {
    setShowError(false);
  };

  const markdownComponents = {
    code(props) {
      const {node, ...rest} = props;
      return <Code
              colorScheme='whiteAlpha'
              overflowWrap='break-word'
              wordBreak='break-all'
              maxW='100%'
              whiteSpace='normal'
              {...props}
            />;
    },
    h1(props) {
      const {node, ...rest} = props;
      return <Text
              color='white'
              fontSize='28px'
              fontWeight='bold'
              {...rest}
              />;
    },
    h2(props) {
      const {node, ...rest} = props;
      return <Text
              color='white'
              fontSize='24px'
              fontWeight='bold'
              {...rest}
              />;
    },
    h3(props) {
      const {node, ...rest} = props;
      return <Text
              color='white'
              fontSize='20px'
              fontWeight='bold'
              {...rest}
              />;
    },
    p(props) {
      const {node, ...rest} = props;
      return <Text
              color='white'
              {...rest}
              />;
    },
    ol(props) {
      const {node, ...rest} = props;
      return <OrderedList {...rest} />
    },
    ul(props) {
      const {node, ...rest} = props;
      return <UnorderedList {...rest} />
    },
    li(props) {
      const {node, ...rest} = props;
      return <ListItem
              color='white'
              {...rest}
              />;
    }
  };

  const allowedElements = ['h1', 'h2', 'h3', 'p', 'strong', 'em', 'ol', 'ul', 'li', 'code', 'pre'];

  return (
    <MainLayout>
      <ErrorModal message={errorMsg} showError={showError} closeError={closeError} />
      {
        status === "success" &&
        <>
          <Flex alignItems='center' flexDirection='column' gap='20px' h='500px'>
            <Text
              color='white'
              fontSize='64px'
              fontWeight='bold'>
              Report generated!
            </Text>
            <Link
              color='white'
              fontSize='20px'
              href={report.url}
              isExternal>
              {report.url} <ExternalLinkIcon mx="2px" />
            </Link>
            <Text
              color='white'
              fontSize='14px'
              fontWeight='100'
              fontStyle='italic'
              >
              Processing time: {report.processingTime}
            </Text>
            {
              report.results.map((result) => {
                return (
                  <Accordion allowToggle>
                    <AccordionItem>
                      <AccordionButton>
                        <Text align="center" color='#fff' fontSize='30px' fontWeight='bold'>
                          {result.category}
                        </Text>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel w='100%'>
                        <Flex justifyContent='space-around' flexDirection='row' gap='20px' h='100%' w='100%'>
                          {/* Context: */}
                          {
                            result.context &&
                            result.context.length !== 0 &&
                            <Flex flex="1 1 0" alignItems='center' direction='column' wordBreak='break-all' wordWrap='break-word' whiteSpace='pre-wrap' gap='10px'>
                              {
                                result.context.map((i) => {
                                  switch (i.type) {
                                    case "text":
                                      return <Text color='white'>{i.text}</Text>;
                                    case "code":
                                      return <Code
                                        colorScheme='whiteAlpha'
                                        overflowWrap='break-word'
                                        wordBreak='break-all'
                                        maxW='100%' // Ensure it does not exceed the width of the parent
                                        whiteSpace='normal' // Override any inherited whiteSpace properties
                                      >
                                        {i.code}
                                      </Code>
                                    case "image":
                                      return <Image w='400px' src={i.imageUrl} />
                                    default:
                                      return null;
                                  }
                                })
                              }
                            </Flex>
                          }
                          {/* Analysis results: */}
                          <Flex flex="1 1 0" direction='column' wordBreak='break-all' wordWrap='break-word' whiteSpace='pre-wrap' gap='10px'>
                            <Markdown
                              components={markdownComponents}
                              allowedElements={allowedElements}>
                              {result.response}
                            </Markdown>
                            <IconButton
                              variant='outline'
                              colorScheme='whiteAlpha'
                              aria-label='Copy Markdown'
                              icon={<CopyIcon />}
                              onClick={() => navigator.clipboard.writeText(result.response)}
                            />
                          </Flex>
                        </Flex>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                )
              })
            }
          </Flex>
        </>
      }
    </MainLayout>
  );
};

export default Report;
