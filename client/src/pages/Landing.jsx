import {
	Button,
  Card,
  CardHeader,
  CardBody,
	Flex,
	Spinner,
	Text,
	Input,
	UnorderedList,
	ListItem
} from '@chakra-ui/react';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startJob } from 'src/api';
import ErrorModal from 'src/components/ErrorModal';
import MainLayout from 'src/layouts/MainLayout';

const Landing = () => {
  const [siteURL, setSiteURL] = useState('');
	const [buttonLoading, setButtonLoading] = useState(false);
	const [showError, setShowError] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');

	const navigate = useNavigate();

	const inputRef = useRef(null);

	// Autofocus
	useEffect(() => {
		inputRef.current.focus();
	}, []);

	const handleChange = (event) => {
		setSiteURL(event.target.value);
	}

	const handleSubmit = () => {
		setButtonLoading(true);
		startJob({ url: siteURL }).then(({ jobId }) => {
			navigate(`/job?jobId=${jobId}`);
		}).catch((err) => {
			setButtonLoading(false);
			setErrorMsg(err.message);
			setShowError(true);
		});
	}

	const closeError = () => {
		setShowError(false);
	}

	const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  // TODO: Clean up the below and make it unique (The styling, etc.)
	return (
		<MainLayout>
			<ErrorModal message={errorMsg} showError={showError} closeError={closeError} />
			<Flex flexDirection='column' gap="40px">
				<Flex justifyContent="center" flexDirection="column" gap="10px">
					<Text
						textAlign='center'
						color='white'
						marginBottom='-30px'
						fontSize='20px'
						fontWeight='100'>
						Introducing your web companion:
					</Text>
					<Flex justifyContent='center' flexDirection='row' gap='8px'>
						<Text
							letterSpacing='8px'
							fontSize='100px'
							fontWeight='bold'
              >
							UX Sleuth
						</Text>
						<Text
							fontSize='100px'>
							🧐
						</Text>
					</Flex>
				</Flex>
				<Flex justifyContent="center" alignItems="center" flexDirection="column" gap="20px">
					<Card
						p='0px'
						w='70%'
						// bgImage={darkGradient}
						// bgSize='cover'
						// bgPosition='50%'
            // bgColor='brand.400'
						>
						<Flex justifyContent="center" flexDirection='column' p='20px' w='100%' h='100%'>
							<Flex justifyContent="center" flexDirection='row' gap='10px' w='100%' h='100%' minW='60%'>
								<Input
									color='white'
									bg='brand.300'
									border='transparent'
									borderRadius='10px'
									fontSize='lg'
									size='lg'
									w='300px'
									maxW='100%'
									h='46px'
									placeholder="https://..."
									ref={inputRef}
									onChange={handleChange}
									onKeyDown={handleKeyDown}
								/>
								<Button
									size='lg'
									borderRadius='10px'
									h='46px'
									w='100px'
									onClick={handleSubmit}>
									{
										buttonLoading ?
										<Spinner />
										:
										"Sleuth!"
									}

								</Button>
							</Flex>
							<Text
								textAlign='center'
								color='white'
								fontSize='14px'
								fontWeight='100'
								fontStyle='italic'
								>
								Sleuth your website for free.
							</Text>
						</Flex>
					</Card>
				</Flex>
				<Flex gap='20px'>
					<Card>
						<CardHeader display='flex' justifyContent='center' mb='24px'>
							<Text fontSize='30px' fontWeight='bold'>
								How do we work?
							</Text>
						</CardHeader>
						<Flex direction='column' gap='20px'>
							<Text>
								Using the leading LLM AI model powered by OpenAI, we deliver a comprehensive analysis of your webpage across several metrics related to:
							</Text>
							<UnorderedList>
								<ListItem>Layout, Content, & Relevance</ListItem>
								<ListItem>Search Engine Optimization (SEO)</ListItem>
								<ListItem>Accessibility</ListItem>
								<ListItem>More to come...</ListItem>
							</UnorderedList>
							<Text>
								We feed our model a comprehensive set of information gathered from your webpage so that you get the most effective automated analysis.
							</Text>
							<Text fontWeight='bold'>
								We don't just give you a number; we give you feedback.
							</Text>
						</Flex>
					</Card>
					<Card>
						<CardHeader display='flex' justifyContent='center' mb='24px'>
							<Text fontSize='30px' fontWeight='bold'>
								Our vision.
							</Text>
						</CardHeader>
						<Flex direction='column' gap='20px'>
							<Text>
								We envision a future heavily invested in the use and development of AI; not as a replacement for creative, human work, but as an aid to professionals.
								Our goal is to progress this vision by creating a tool used by web developers of all skill levels so as to enhance their abilities.
								UX Sleuth can be used as a sounding board, learning tool, and consultant.
							</Text>
						</Flex>
					</Card>
				</Flex>
			</Flex>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />

    </MainLayout>
	);
};

export default Landing;
