/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.smi.config;

import com.smi.dao.UserDao;
import com.smi.model.Users;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Resource(name = "authenticationManager")
public class CustomAuthenticationManager implements AuthenticationManager {

    @Autowired
    UserDao userDao;

    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getPrincipal() + "";
        String password = authentication.getCredentials() + "";

        Users user = userDao.findByUsername(username);
        if (user == null) {
            System.out.println("User do not exist");
            throw new BadCredentialsException("1000");
        }
        if (!password.equals(user.getPassword())) {
            System.out.println("Wrong password");
            throw new BadCredentialsException("1000");
        }
        return new UsernamePasswordAuthenticationToken(username, password);
    }
}
