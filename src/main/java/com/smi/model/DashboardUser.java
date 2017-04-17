/*
 * Copyright 2017 Nejm.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.smi.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.BigInteger;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author Nejm
 */
@Entity
@Table(name = "DASHBOARD_USER", catalog = "", schema = "TEST")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "DashboardUser.findAll", query = "SELECT d FROM DashboardUser d")
    , @NamedQuery(name = "DashboardUser.findById", query = "SELECT d FROM DashboardUser d WHERE d.id = :id")
    , @NamedQuery(name = "DashboardUser.findByIdDashboard", query = "SELECT d FROM DashboardUser d WHERE d.idDashboard = :idDashboard")
    , @NamedQuery(name = "DashboardUser.findByUsername", query = "SELECT d FROM DashboardUser d WHERE d.username = :username")
    , @NamedQuery(name = "DashboardUser.findByRoleName", query = "SELECT d FROM DashboardUser d WHERE d.roleName = :roleName")})
public class DashboardUser implements Serializable {

    private static final long serialVersionUID = 1L;
    // @Max(value=?)  @Min(value=?)//if you know range of your decimal fields consider using these annotations to enforce field validation
    @Id
    @Basic(optional = false)
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(name = "ID_DASHBOARD")
    private Long idDashboard;
    @Column(name = "USERNAME")
    private String username;
    @Column(name = "ROLE_NAME")
    private String roleName;

    public DashboardUser() {
    }

    public DashboardUser(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdDashboard() {
        return idDashboard;
    }

    public void setIdDashboard(Long idDashboard) {
        this.idDashboard = idDashboard;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof DashboardUser)) {
            return false;
        }
        DashboardUser other = (DashboardUser) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.smi.model.DashboardUser[ id=" + id + " ]";
    }
    
}
