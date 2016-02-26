<%
$.each(data, function(i, v){
%>
<li data-userid="<%= v.userId %>" class="<%= v.userId === myId ? 'myself' : '' %>"><%= v.phone %>:<strong><%= v.level %></strong></li>
<%
});
%>