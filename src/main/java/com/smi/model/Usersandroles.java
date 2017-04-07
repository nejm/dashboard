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
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
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
@Table(name = "USERSANDROLES", catalog = "", schema = "TEST")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Usersandroles.findAll", query = "SELECT u FROM Usersandroles u")
    , @NamedQuery(name = "Usersandroles.findByUserroleId", query = "SELECT u FROM Usersandroles u WHERE u.userroleId = :userroleId")
    , @NamedQuery(name = "Usersandroles.findByUserId", query = "SELECT u FROM Usersandroles u WHERE u.userId = :userId")
    , @NamedQuery(name = "Usersandroles.findByRoleId", query = "SELECT u FROM Usersandroles u WHERE u.roleId = :roleId")})
public class Usersandroles implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @Column(name = "USERROLE_ID")
    private Long userroleId;
    @Column(name = "USER_ID")
    private Long userId;
    @Column(name = "ROLE_ID")
    private Long roleId;

    public Usersandroles() {
    }

    public Usersandroles(Long userroleId) {
        this.userroleId = userroleId;
    }

    public Long getUserroleId() {
        return userroleId;
    }

    public void setUserroleId(Long userroleId) {
        this.userroleId = userroleId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (userroleId != null ? userroleId.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Usersandroles)) {
            return false;
        }
        Usersandroles other = (Usersandroles) object;
        if ((this.userroleId == null && other.userroleId != null) || (this.userroleId != null && !this.userroleId.equals(other.userroleId))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.smi.model.Usersandroles[ userroleId=" + userroleId + " ]";
    }
    
}
