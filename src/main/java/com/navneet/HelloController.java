package com.navneet.ai_rca_platform;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/")
    public String hello() {
        return "Welcome to PRISM-An AI-Powered AIOps Platform for CI/CD Failure Analysis";
    }
}