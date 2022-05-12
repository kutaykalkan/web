import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { unmountComponentAtNode } from "react-dom";
import ValidationComponent from './ValidationComponent';
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
let container:any = null;
beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe("Validate Component", () => {
    it("displays request object on success", async() => {
        const component = render(<ValidationComponent />, container);
        var content = JSON.stringify({
            "component": {
                "type": "capacitor",
                "nominal_capacitance": 2.6,
                "working_voltage": 4.2,
                "tolerance": 6,
                "working_temperature": 3.6,
                "temperature_coefficient": 6
            }
        });
        const requestElement =  await component.getByLabelText('Request');
        await act(async() => {
            await fireEvent.change(requestElement, {target: {value: content}});
        });
        
        const mockPost = jest.fn();
        mockPost.mockImplementation(() => {
            const myResponse = JSON.parse(JSON.stringify({
                status: 200,
                data: content
            }));
            return Promise.resolve(myResponse);
        });
        mockedAxios.post.mockImplementation(mockPost);
        await act(async() => {
            await fireEvent.click(component.getByText('Get Component'));
        });
        const responseElement =  await component.getByLabelText('Response');
        expect(responseElement).toHaveTextContent(content.replaceAll("\"", "\\\""));
    });
    
    it("displays error message when request is invalid json", async() => {
        const component = render(<ValidationComponent />, container);
        component.getByLabelText('Request').textContent = '{';
        await act(async() => {
            await fireEvent.click(component.getByText('Get Component'));
        });
        const responseElement = await component.getByLabelText('Response');
        expect(responseElement).toHaveTextContent("Unexpected end of JSON input");
    });

    it("displays error object when request is empty", async() => {
        const component = render(<ValidationComponent />, container);
        var content = JSON.stringify({});
        const requestElement =  await component.getByLabelText('Request');
        await act(async() => {
            await fireEvent.change(requestElement, {target: {value: content}});
        });
        
        const mockPost = jest.fn();
        mockPost.mockImplementation(() => {
            const myResponse = JSON.stringify({
                    statusCode: 400,
                    message: "Component is not defined in request!",
                    error: "Bad Request"
                    });
            return Promise.reject(new Error(myResponse));
        });
        mockedAxios.post.mockImplementation(mockPost);
        
        await act(async() => {
            await fireEvent.click(component.getByText('Get Component'));
        });
        const responseElement =  await component.getByLabelText('Response');
        expect(responseElement).toHaveTextContent(JSON.stringify({
            "statusCode": 400,
            "message": "Component is not defined in request!",
            "error": "Bad Request"
          }).replaceAll("\"", "\\\""));
    });

    it("displays error object with validation messages", async() => {
        const component = render(<ValidationComponent />, container);
        var content = JSON.stringify({
            "component": {
                "type": "capacitor",
                "nominal_capacitance": 2.6,
                "working_voltage": 4.2,
                "tolerance": 6
            }
        });
        const requestElement =  await component.getByLabelText('Request');
        await act(async() => {
            await fireEvent.change(requestElement, {target: {value: content}});
        });
        
        const mockPost = jest.fn();
        mockPost.mockImplementation(() => {
            const myResponse = JSON.stringify({
                response: {
                    data: {
                        statusCode: 400,
                        message: [
                            {
                                "working_temperature": {
                                    "isDefined": "working_temperature should not be null or undefined",
                                    "isNumber": "working_temperature must be a number conforming to the specified constraints"
                                }
                            },
                            {
                                "temperature_coefficient": {
                                    "isDefined": "temperature_coefficient should not be null or undefined",
                                    "isNumber": "temperature_coefficient must be a number conforming to the specified constraints"
                                }
                            }
                        ],
                        error: "Bad Request"
            }}});
            return Promise.reject(new Error(myResponse));;
        });
        mockedAxios.post.mockImplementation(mockPost);
        await act(async() => {
            await fireEvent.click(component.getByText('Get Component'));
        });
        const responseElement =  await component.getByLabelText('Response');
        expect(responseElement).toHaveTextContent(JSON.stringify({
            "statusCode": 400,
            "message": [
                {
                    "working_temperature": {
                        "isDefined": "working_temperature should not be null or undefined",
                        "isNumber": "working_temperature must be a number conforming to the specified constraints"
                    }
                },
                {
                    "temperature_coefficient": {
                        "isDefined": "temperature_coefficient should not be null or undefined",
                        "isNumber": "temperature_coefficient must be a number conforming to the specified constraints"
                    }
                }
            ],
            "error": "Bad Request"
        }).replaceAll("\"", "\\\""));
    });
});